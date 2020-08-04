const _ = require("lodash");
const formidable = require("formidable");
const Utils = require("../shared/utils");
const afs = require("./afs");
const MongoDB = require("./mongo");
const MD5 = require("crypto-js/md5");
const fs = require("fs");
const path = require("path");

function session(req) {
	if (req.cookies.session_id) {
		return MongoDB.Authentication().then(AuthCol => AuthCol.findOne({_id: req.cookies.session_id}));
	} else {
		return Promise.resolve(false);
	}
}

function block(res) {
	res.setHeader('Content-type', "application/json");
	res.writeHead(401);
	res.end(JSON.stringify({
		status: "FAIL",
		reason: "Session expired or inactive"
	}));
}

function handleSearch(req, res, next) {
	session(req, res).then(auth => {
		if (auth) {
			MongoDB.Images().then(ImageCol => {
				let qParams = _.chain(req.query).transform((acc, value, key) => {
					if (_.size(value)) {
						acc[key] = value;
					}
				}, {userid: auth.userid}).value();
				ImageCol.find(qParams).toArray().then(files => {
					res.setHeader('Content-Type', 'application/json');
					res.writeHead(200);
					res.end(JSON.stringify({
						status: "SUCCESS",
						files
					}, null, 2));
				});
			}).catch(Utils.error);
		} else {
			block(res);
		}
	});
}

function handleUpload(req, res, next) {
	session(req, res).then(auth => {
		if (auth) {
			afs.stat("./Files").then(_.stubTrue).catch(_.stubFalse).then(exists => {
				if (exists) {
					return true;
				} else {
					return afs.mkdir("./Files", {recursive: true}).then(_.stubTrue).catch(_.stubFalse);
				}
			}).then(success => {
				let form = formidable({
					hash: "md5",
					multiples: true,
					keepExtensions: true,
					uploadDir: "./Files"
				});
				form.parse(req, (err, fields, values) => {
					let tags = _.compact(fields.tags.split(' '));
					let uploaded = [];
					if (_.isArray(values.fileToUpload)) {
						uploaded = values.fileToUpload;
					} else {
						uploaded = [values.fileToUpload];
					}
					MongoDB.Images().then(ImageCol => {
						let files = _.transform(uploaded, (acc, file, key) => {
							acc.push({
								userid: auth.userid,
								filepath: path.normalize(file.path),
								filename: file.name,
								mimetype: file.type,
								md5: file.hash,
								tags
							});
						}, []);
						ImageCol.insertMany(files);
						res.setHeader('Content-Type', 'application/json');
						res.writeHead(200);
						res.end(JSON.stringify({fields, values}));
					}).catch(Utils.error);
				});
			})
		} else {
			block(res);
		}
	});
}

function handleDownload(req, res, next) {
	if (session(req, res)) {
		if (req.params.file_id) {
			fs.createReadStream(`Files/${req.params.file_id}`).on("error", error => {
				next();
			}).pipe(res);
		} else {
			next();
		}
	} else {
		block(res);
	}
}

/**
 *
 * @param {Router} router
 */
module.exports = function (router) {
	router.get("/file/:file_id", handleDownload);
	let files = router.route("/file");
	files.get(handleSearch);
	files.post(handleUpload);
	const UPLOAD_PATH = `Files/`;
	afs.mkdir(UPLOAD_PATH, {recursive: true}).then(_.stubTrue).catch(_.stubFalse).then(result => {
		if (result) {
			let watcher = fs.watch(UPLOAD_PATH, {recursive: true}, (type, name) => {
				switch (type) {
					case "rename":
						afs.stat(path.join(UPLOAD_PATH, name)).then(_.stubTrue).catch(_.stubFalse).then(exists => {
							if (!exists) {
								MongoDB.Images().then(ImageCol => {
									let filepath = path.normalize(path.join(UPLOAD_PATH, name));
									ImageCol.deleteOne({filepath});
									//You could log this
								})
							}
						});
						break;
					case "change":
						break;
				}
			});
			process.on("beforeExit", code => {
				watcher.close();
			});
			MongoDB.Images().then(ImageCol => {
				ImageCol.find({}).toArray().then(items => Promise.all(items.map(item =>
					afs.stat(item.filepath)
					.then(stat => false)
					.catch(error => ImageCol.deleteOne(item)
					.then(op => item))
				)))
				.then(_.compact)
				//.then(...); You could log this
			});
		}
	});
};
const _ = require("lodash");
const formidable = require("formidable");
const {parse} = require("url");
const Utils = require("../shared/utils");
const afs = require("./afs");
const MongoDB = require("./mongo");

async function handleAPI(req, res) {
	let form;
	switch (true) {
		case /^\/user\/login\/?$/.test(req.url):
			break;
		case /^\/file\/?\??([^=]+=[^=]+&?)*$/.test(req.url):
			switch (req.method) {
				case "GET":
					MongoDB.Images().then(collection => {
						let parsed = parse(req.url, true);
						collection.find({tags: parsed.query.tags.split(/;/)}).toArray().then(files => {
							res.writeHead(200, {'content-type': 'application/json'});
							res.end(JSON.stringify({files}, null, 2));
						});
					}).catch(Utils.error);
					return true;
				case "POST":
					await afs.mkdir("./Files", {recursive: true});
					form = formidable({multiples: true, keepExtensions: true, uploadDir: "./Files"});
					form.parse(req, (err, fields, values) => {
						let tags = _.compact(fields.tags.split(' '));
						if (!_.isArray(values.fileToUpload)) {
							values.fileToUpload = [values.fileToUpload];
						}
						MongoDB.Images().then(collection => {
							let files = _.transform(values.fileToUpload, (acc, file, key) => {
								acc.push({
									filepath: file.path,
									filename: file.name,
									mimetype: file.type,
									tags
								});
							}, []);
							collection.insertMany(files);
							res.writeHead(200, {'content-type': 'application/json'});
							res.end(JSON.stringify({fields, values}, null, 2));
						}).catch(Utils.error);
					});
					return true;
				default:
					break;
			}
			break;
		default:
			break;
	}
}

module.exports = {
	handleAPI
};
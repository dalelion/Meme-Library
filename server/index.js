const cookieParser = require("cookie-parser");
const formidable = require("formidable");
const {parse} = require("url");
const mongo = require("mongodb");
const http = require("http");
const _ = require("lodash");
const afs = require("./afs");
const path = require("path");
const {DEVELOPMENT, PRODUCTION} = require("../shared/env");
const Utils = require("../shared/utils");
const PUBLIC_DIR = "../public";
console.log(DEVELOPMENT, PRODUCTION);
const cookies = cookieParser("memes");
const url = 'mongodb://localhost:27017';

function handleCookie(req, res) {
	return new Promise(resolve => {
		cookies(req, res, callback => resolve(false));
		resolve(true);
	});
}

async function handleAPI(req, res) {
	let form;
	switch (true) {
		case /^\/user\/login\/?$/.test(req.url):
			break;
		case /^\/file\/?$/.test(req.url):
			switch (req.method) {
				case "GET":
					mongo.connect(url, {
						useNewUrlParser: true,
						useUnifiedTopology: true
					}, (err, client) => {
						if (err) {
							console.error(err);
							return;
						} else {
							let parsed = parse(req.url, true);
							const db = client.db('MemeLibrary');
							const collection = db.collection('Images');
							collection.find({tags: parsed.query.tags.split(/;/)}).toArray().then(files => {
								res.writeHead(200, {'content-type': 'application/json'});
								res.end(JSON.stringify({files}, null, 2));
							});
						}
					});
					return true;
				case "POST":
					await afs.mkdir("./Files", {recursive: true});
					form = formidable({multiples: true, keepExtensions:true, uploadDir: "./Files"});
					form.parse(req, (err, fields, values) => {
						let tags = _.compact(fields.tags.split(' '));
						if (!_.isArray(values)) {
							values.fileToUpload = [values.fileToUpload];
						}
						console.log(values.fileToUpload);
						res.writeHead(200, {'content-type': 'application/json'});
						res.end(JSON.stringify({fields, values}, null, 2));
						mongo.connect(url, {
							useNewUrlParser: true,
							useUnifiedTopology: true
						}, (err, client) => {
							if (err) {
								console.error(err);
								return;
							} else {
								const db = client.db('MemeLibrary');
								const collection = db.collection('Images');
								let files = _.transform(values.fileToUpload, (acc, file, key) => {
									acc.push({
										filepath: file.path,
										filename: file.name,
										mimetype: file.type,
										tags
									});
								}, []);
								collection.insertMany(files);
							}
						});
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

function handlePublic(req, res) {
	let PATH;
	switch (req.url) {
		case "/":
		case "/index.html":
		case "/index.htm":
			PATH = path.join(__dirname, PUBLIC_DIR, "index.html");
			break;
		default:
			PATH = path.join(__dirname, PUBLIC_DIR, req.url);
			break;
	}
	return new Promise(
		(resolve, reject) => {
			fs.exists(PATH, exists => {
				resolve(exists);
				if (exists) {
					fs.createReadStream(PATH).pipe(res);
				}
			});
		}
	)
}

function handleNotFound(req, res) {
	return new Promise(resolve => {
		fs.createReadStream(path.join(__dirname, PUBLIC_DIR, "404.png")).pipe(res);
		resolve(true);
	});
}

const SERVER = http.createServer(async (req, res) => {
	Utils.debug(`${req.method} ${req.url}`);
	await handleCookie(req, res) ||
	await handleAPI(req, res) ||
	await handlePublic(req, res) ||
	await handleNotFound(req, res);
});

SERVER.listen(3000, "0.0.0.0", () => {
	const ADDRESS_INFO = SERVER.address();
	Utils.log(`Listening on ${ADDRESS_INFO.address}:${ADDRESS_INFO.port} @ ${ADDRESS_INFO.family}`);
});

if (DEVELOPMENT) {
	global.SERVER = SERVER;
}
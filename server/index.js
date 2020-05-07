const http = require("http");
const fs = require("fs");
const path = require("path");
const {DEVELOPMENT, PRODUCTION} = require("../shared/env");

console.log(DEVELOPMENT, PRODUCTION);

function handlePublic(req, res) {
	let PATH;
	switch (req.url) {
		case "/":
		case "/index.html":
		case "/index.htm":
			PATH = path.join(__dirname, "public", "index.html");
			break;
		default:
			PATH = path.join(__dirname, "public", req.url);
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
		fs.createReadStream(path.join(__dirname, "public", "404.png")).pipe(res);
		resolve(true);
	});
}

const SERVER = http.createServer(async (req, res) => {
	process.stdout.write(`${req.method} ${req.url}\n`);
	await handlePublic(req, res) ||
	await handleNotFound(req, res);
});

SERVER.listen(80, "0.0.0.0", () => {
	const ADDRESS_INFO = SERVER.address();
	process.stdout.write(`Listening on ${ADDRESS_INFO.address}:${ADDRESS_INFO.port} @ ${ADDRESS_INFO.family}\n`);
});

if (DEVELOPMENT) {
	global.SERVER = SERVER;
}
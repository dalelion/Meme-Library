const path = require("path");
const fs = require("fs");
const PUBLIC_DIR = "../../public";

async function handlePublic(req, res) {
	let PATH;
	switch (req.url) {
		case "/":
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

async function handleNotFound(req, res) {
	return new Promise(resolve => {
		fs.createReadStream(path.join(__dirname, PUBLIC_DIR, "404.png")).pipe(res);
		resolve(true);
	});
}

module.exports = {
    handleNotFound,
    handlePublic
};
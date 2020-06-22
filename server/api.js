const formidable = require("formidable");
const {parse} = require("url");
const mongo = require("mongodb");
const _ = require("lodash");
const afs = require("./afs");
const mongo_url = 'mongodb://localhost:27017';

async function handleAPI(req, res) {
    let form;
    console.log(/^\/file\/?\?([\S]+=[^=]+&?)*$/.test(req.url));
    console.log(req.url);
	switch (true) {
		case /^\/user\/login\/?$/.test(req.url):
			break;
		case /^\/file\/?\??([^=]+=[^=]+&?)*$/.test(req.url):
			switch (req.method) {
				case "GET":
					mongo.connect(mongo_url, {
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
                        console.log("HERE");
						mongo.connect(mongo_url, {
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
                                console.log("HERE");
                                res.writeHead(200, {'content-type': 'application/json'});
                                res.end(JSON.stringify({fields, values}, null, 2));
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

module.exports = {
    handleAPI
};
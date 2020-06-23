const cookieParser = require("cookie-parser");
const cookies = cookieParser("memelibrary");
const {v4: uuidv4} = require("uuid");
const MongoDB = require("./mongo");

async function handleCookies(req, res) {
	return new Promise(resolve => {
		cookies(req, res, callback => resolve(false));
		resolve(true);
	});
}

const MAX_AGE = 5 * 6e+4;

async function handleAuth(req, res) {
	const EXPIRY = Date.now() + MAX_AGE;
	switch (req.url) {
		default:
		case "/":
			return false;
		case "/auth":
			switch (req.method) {
				case "GET":
					res.setHeader("Content-Type", "application/json");
					MongoDB.Authentication().then(collection => {
						collection.findOne({_id: req.cookies.session_id}).then(row => {
							if (row && Date.now() < row.expireAt) {
								res.writeHead(200);
								res.end(JSON.stringify({user_id: null, status: "SUCCESS"}));
							} else {
								res.writeHead(401);
								res.end(JSON.stringify({status: "FAIL"}));
							}
						});
					});
					return true;
				case "PUT":
					res.setHeader("Content-Type", "application/json");
					MongoDB.Authentication().then(collection => {
						collection.findOne({_id: req.cookies.session_id}).then(row => {
							if (row && Date.now() < row.expireAt) {
								const EXPIRES = new Date(EXPIRY);
								collection.updateOne({_id: req.cookies.session_id}, [{$set: {expireAt: EXPIRES}}], {upsert: true}).then(row => {
									res.setHeader("Set-Cookie", `session_id=${req.cookies.session_id}; Expires=${EXPIRES.toUTCString()}`);
									res.writeHead(200);
									res.end(JSON.stringify({user_id: null, status: "SUCCESS"}));
								});
							} else {
								res.writeHead(401);
								res.end(JSON.stringify({status: "FAIL"}));
							}
						});
					});
					return true;
				case "POST":
					res.setHeader("Content-Type", "application/json");
					MongoDB.Authentication().then(collection => {
						collection.findOne({_id: req.cookies.session_id}).then(row => {
							if (row && Date.now() > row.expireAt) {
								res.writeHead(200);
								res.end(JSON.stringify({user_id: null, status: "SUCCESS"}));
							} else {
								const ID = uuidv4();
								const EXPIRES = new Date(EXPIRY);
								collection.insertOne({_id: ID, user_id: null, expireAt: EXPIRES}).then(result => {
									res.setHeader("Set-Cookie", `session_id=${ID}; Expires=${EXPIRES.toUTCString()}`);
									res.writeHead(200);
									res.end(JSON.stringify({user_id: null, status: "SUCCESS"}));
								});
							}
						});
					});
					return true;
				case "DELETE":
					res.setHeader("Content-Type", "application/json");
					MongoDB.Authentication().then(collection => {
						collection.findOne({_id: req.cookies.session_id}).then(row => {
							if (row) {
								collection.deleteOne({_id: req.cookies.session_id}).then(result => {
									res.setHeader("Set-Cookie", `session_id=${req.cookies.session_id}; Expires=${new Date().toUTCString()}`);
									res.writeHead(200);
									res.end(JSON.stringify({user_id: null, status: "SUCCESS"}));
								});
							} else {
								res.writeHead(404);
								res.end(JSON.stringify({status: "FAIL"}));
							}
						});
					});
					return true;
			}
	}
}

module.exports = {
	handleCookies,
	handleAuth
};
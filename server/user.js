const MongoDB = require("./mongo");
const {uuid} = require("uuidv4");
function handleUser(req, res, next) {
	switch (req.method) {
		case "GET":
			res.setHeader("Content-Type", "application/json");
			res.end();
			break;
		case "POST":
			res.setHeader("Content-Type", "application/json");
			let body = "";
			req.on("data", function (data) {
				body += data;
			});
			req.on("end",function () {
				const MESSAGE = JSON.parse(body);
				MongoDB.Users().then(collection => {
					collection.findOne({username: MESSAGE.username}).then(row => {
						if (row) {
							res.writeHead(400);
							res.end(JSON.stringify({
								status: "FAIL",
								reason: "Username not available"
							}));
						} else {
							if (MESSAGE.password1 === MESSAGE.password2) {
								collection.insertOne({
									_id: uuid(),
									username: MESSAGE.username,
									password: MESSAGE.password1
								}).then(result => {
									res.writeHead(200);
									res.end(JSON.stringify({
										status: "SUCCESS"
									}));
								});
							} else {
								res.writeHead(400);
								res.end(JSON.stringify({
									status: "FAIL",
									reason: "Password does not match"
								}));
							}
						}
					})
				});
			});
			break;
		default:
			next();
			break;
	}
}

/**
 *
 * @param {Router} router
 */
module.exports = function (router) {
	router.all("/user", handleUser);
};
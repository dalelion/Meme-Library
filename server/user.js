const MongoDB = require("./mongo");

function handleUser(req, res, next) {
	switch (req.method) {
		case "GET":
			res.end();
			break;
		case "POST":
			let body = "";
			req.on("data", function (data) {
				body += data;
			});
			req.on("end",function () {
				const MESSAGE = JSON.parse(body);
				console.log(MESSAGE);
				
				MongoDB.Users().then(collection => {
				});
				res.end();
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
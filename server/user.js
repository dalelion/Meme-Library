const MongoDB = require("./mongo");
const {uuid} = require("uuidv4");
function handleUser(req, res, next) {
	switch (req.method) {
		case "GET":
			res.setHeader("Content-Type", "application/json");
			Promise.all([MongoDB.Users(), MongoDB.Authentication()]).then(results => {
				let [UserCol, AuthCol] = results;
				AuthCol.findOne({_id: req.cookies.session_id}).then(auth => {
					if (auth && Date.now() < auth.expireAt) {
						UserCol.findOne({_id: auth.userid}).then(user => {
							if (user) {
								res.writeHead(200);
								res.end(JSON.stringify({
									status: "SUCCESS",
									userid: user._id,
									username: user.username
								}))
							} else {
								res.writeHead(404);
								res.end(JSON.stringify({
									status: "FAIL",
									reason: "User not found"
								}));
							}
						})
					} else {
						res.writeHead(401);
						res.end(JSON.stringify({
							status: "FAIL",
							reason: "Session expired or inactive"
						}));
					}
				});
			});
			break;
		case "POST":
			res.setHeader("Content-Type", "application/json");
			let body = "";
			req.on("data", function (data) {
				body += data;
			});
			req.on("end",function () {
				const MESSAGE = JSON.parse(body);
				MongoDB.Users().then(UserCol => {
					UserCol.findOne({username: MESSAGE.username}).then(row => {
						if (row) {
							res.writeHead(400);
							res.end(JSON.stringify({
								status: "FAIL",
								reason: "Username not available"
							}));
						} else {
							if (MESSAGE.password1 === MESSAGE.password2) {
								const ID = uuid();
								UserCol.insertOne({
									_id: ID,
									username: MESSAGE.username,
									password: MESSAGE.password1
								}).then(result => {
									res.writeHead(200);
									res.end(JSON.stringify({
										status: "SUCCESS",
										userid: ID,
										username: MESSAGE.username
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
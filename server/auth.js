const cookieParser = require("cookie-parser");
const handleCookies = cookieParser("memelibrary");
const {v4: uuidv4} = require("uuid");
const MongoDB = require("./mongo");

const MAX_AGE = 5 * 6e+4;

function handleSession(req, res, next) {
	MongoDB.Authentication().then(AuthCol => {
		AuthCol.findOne({_id: req.cookies.session_id}).then(auth => {
			if (auth && NOW < auth.expireAt) {
				const UPDATE = {
					...auth,
					expireAt: new Date(Date.now() + MAX_AGE)
				};
				AuthCol.updateOne({_id: req.cookies.session_id}, [{$set: UPDATE}], {upsert: true}).finally(() => {
					res.setHeader("User-Session", true);
					res.setHeader("Set-Cookie", `session_id=${req.cookies.session_id}; Expires=${UPDATE.expireAt.toUTCString()}; Path=/`);
					next();
				});
			} else {
				res.setHeader("User-Session", false);
				next();
			}
		});
	});
}

function handleAuth(req, res, next) {
	switch (req.method) {
		case "GET":
			MongoDB.Authentication().then(AuthCol => {
				AuthCol.findOne({_id: req.cookies.session_id}).then(auth => {
					res.setHeader("Content-Type", "application/json");
					if (auth && Date.now() < auth.expireAt) {
						res.writeHead(200);
						res.end(JSON.stringify({
							status: "SUCCESS",
							userid: auth.userid
						}));
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
		case "PUT":
			MongoDB.Authentication().then(AuthCol => {
				AuthCol.findOne({_id: req.cookies.session_id}).then(auth => {
					res.setHeader("Content-Type", "application/json");
					if (auth && Date.now() < auth.expireAt) {
						const UPDATE = {
							...auth,
							expireAt: new Date(Date.now() + MAX_AGE)
						};
						AuthCol.updateOne({_id: req.cookies.session_id}, [{$set: UPDATE}], {upsert: true}).then(auth => {
							res.setHeader("Set-Cookie", `session_id=${req.cookies.session_id}; Expires=${UPDATE.expireAt.toUTCString()}; Path=/`);
							res.writeHead(200);
							res.end(JSON.stringify({
								status: "SUCCESS",
								userid: auth.userid
							}));
						});
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
			let body = "";
			req.on("data", function (data) {
				body += data;
			});
			req.on("end", function () {
				const MESSAGE = JSON.parse(body);
				Promise.all([MongoDB.Users(), MongoDB.Authentication()]).then(results => {
					let [UserCol, AuthCol] = results;
					UserCol.findOne({username: MESSAGE.username}).then(user => {
						res.setHeader("Content-Type", "application/json");
						if (user) {
							if (user.password === MESSAGE.password) {
								AuthCol.findOne({_id: req.cookies.session_id}).then(auth => {
									if (auth && Date.now() > auth.expireAt) {
										res.writeHead(200);
										res.end(JSON.stringify({
											status: "SUCCESS",
											userid: auth.userid
										}));
									} else {
										const ID = uuidv4();
										const ENTRY = {
											_id: ID,
											userid: user._id,
											expireAt: new Date(Date.now() + MAX_AGE)
										};
										AuthCol.insertOne(ENTRY).then(result => {
											res.setHeader("Set-Cookie", `session_id=${ID}; Expires=${ENTRY.expireAt.toUTCString()}; Path=/`);
											res.writeHead(200);
											res.end(JSON.stringify({
												status: "SUCCESS",
												userid: user._id
											}));
										});
									}
								})
							} else {
								res.writeHead(400);
								res.end(JSON.stringify({
									status: "FAIL",
									reason: "Bad password"
								}));
							}
						} else {
							res.writeHead(404);
							res.end(JSON.stringify({
								status: "FAIL",
								reason: "User not found"
							}));
						}
					});
				});
			});
			break;
		case "DELETE":
			MongoDB.Authentication().then(AuthCol => {
				AuthCol.findOne({_id: req.cookies.session_id}).then(auth => {
					res.setHeader("Content-Type", "application/json");
					if (auth) {
						AuthCol.deleteOne({_id: req.cookies.session_id}).then(result => {
							res.setHeader("Set-Cookie", `session_id=${req.cookies.session_id}; Expires=${new Date().toUTCString()}; Path=/`);
							res.writeHead(200);
							res.end(JSON.stringify({
								status: "SUCCESS",
								userid: null
							}));
						});
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
	router.use(handleCookies);
	router.use(handleSession);
	router.all("/auth", handleAuth);
};
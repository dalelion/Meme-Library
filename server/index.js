/** @type {module:http} */
const http = require("http");
const {DEVELOPMENT, PRODUCTION} = require("../shared/env");
const Utils = require("../shared/utils");
const router = require("./router");
const finalhandler = require("finalhandler");
const Authentication = require("./auth");
const API = require("./api");
const Query = require("./query");
const Debug = require("./debug");
const Static = require("./static");

Debug(router);
Query(router);
Authentication(router);
API(router);
Static(router);


/**
 *
 * @param {Request} req
 * @param {Response} res
 */
function handler(req, res) {
	router(req, res, finalhandler(req, res));
}
/** @type {Server} */
const SERVER = http.createServer(handler);
SERVER.listen(3000, "0.0.0.0", () => {
	const ADDRESS_INFO = SERVER.address();
	Utils.log(`Listening on ${ADDRESS_INFO.address}:${ADDRESS_INFO.port} @ ${ADDRESS_INFO.family}`);
});
if (DEVELOPMENT) {
	global.SERVER = SERVER;
}
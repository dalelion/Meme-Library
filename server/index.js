const http = require("http");
const {DEVELOPMENT, PRODUCTION} = require("../shared/env");
const Utils = require("../shared/utils");
const {handleCookies, handleAuth} = require("./auth");
const {handleAPI} = require("./api");
const {handleNotFound, handlePublic} = require("./static");

const SERVER = http.createServer(async (req, res) => {
	Utils.debug(`${req.method} ${req.url}`);
	await handleCookies(req, res) ||
	await handleAuth(req, res) ||
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
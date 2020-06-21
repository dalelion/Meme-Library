const cookieParser = require("cookie-parser");
const cookies = cookieParser("memelibrary");

async function handleCookies(req, res) {
	return new Promise(resolve => {
		cookies(req, res, callback => resolve(false));
		resolve(true);
	});
}

module.exports = {
    handleCookies
};
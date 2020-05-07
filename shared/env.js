const DEVELOPMENT = process.argv.includes("--development");
const PRODUCTION = process.argv.includes("--production");

module.exports = {
	DEVELOPMENT,
	PRODUCTION
};
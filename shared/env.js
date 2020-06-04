const DEVELOPMENT = process.argv.includes("--development");
const PRODUCTION = process.argv.includes("--production");
const DEBUG = process.argv.includes("--debug");

module.exports = {
	DEVELOPMENT,
	PRODUCTION,
	DEBUG
};
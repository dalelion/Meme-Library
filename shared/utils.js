const _ = require("lodash");
const ENV = require("./env");

function debug(...args) {
    if (ENV.DEBUG) {
        log(...args);
    }
}

function log(...args) {
    if (_.size(args)) {
        (_.has(process, "stdout.write") ? process.stdout.write : console.log)(`${args.join("\n")}\n`);
    }
}

function error(...args) {
    if (_.size(args)) {
        (_.has(process, "stderr.write") ? process.stderr.write : console.error)(`${args.map(arg => arg.stack).join("\n")}\n`);
    }
}

module.exports = {
    debug,
    log,
    error
};
const _ = require("lodash");
const ENV = require("./env");

function debug(...args) {
    if (ENV.DEBUG) {
        log(...args);
    }
}

function log(...args) {
    if (_.size(args)) {
        if("stdout" in process)  {
            process.stdout.write(`${args.join("\n")}\n`);
        } else {
            console.log(`${args.join("\n")}\n`);
        }
    }
}

function error(...args) {
    if (_.size(args)) {
        if("stdout" in process) {
            process.stderr.write(`${args.map(arg => arg.stack).join("\n")}\n`);
        } else {
            console.error(`${args.map(arg => arg.stack).join("\n")}\n`);
        }
    }
}

module.exports = {
    debug,
    log,
    error
};
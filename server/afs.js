const fs = require("fs");
const {promisify} = require("util");

const mkdir = promisify(fs.mkdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);

module.exports = {
    mkdir,
    readFile,
    writeFile,
    stat
};
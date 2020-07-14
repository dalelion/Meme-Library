const _ = require("lodash");
const Utils = require("../shared/utils");
const colors = require("colors");
/**
 *
 * @param {Request} req
 * @param {Response} res
 * @param {function} next
 */
function handleDebug(req, res, next) {
  res.on("finish", () => {
    let status = `${res.statusCode}`;
    let method = `${req.method}`.magenta;
    let url = `${req.url}`.cyan;
    switch(true) {
      case _.inRange(res.statusCode, 100, 200):
        status = status.grey;
        break;
      case _.inRange(res.statusCode, 200, 300):
        status = status.green;
        break;
      case _.inRange(res.statusCode, 300, 400):
        status = status.yellow;
        break;
      case _.inRange(res.statusCode, 400, 600):
        status = status.red;
        break;
    }
    Utils.debug(`${status} ${method} ${url}`);
  });
  next();
}

module.exports = function (router) {
  router.use(handleDebug);
};
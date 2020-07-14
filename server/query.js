const _ = require("lodash");
const qs = require("query-string");
const URL = require("url");

function handleQuery(req, res, next) {
  if (/\?/.test(req.url)) {
    let url = URL.parse(req.url, true);
    // This is only an array if there are multiple params separated by commas
    req.query = qs.parse(url.search, {arrayFormat: "comma", arrayFormatSeparator: ","});
  }
  next();
}

/**
 *
 * @param {Router} router
 */
module.exports = function (router) {
  router.use(handleQuery);
};
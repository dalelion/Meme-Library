const path = require("path");
const fs = require("fs");
const afs = require("./afs");
const PUBLIC_DIR = "./public";

function handlePublic(req, res, next) {
  let PATH;
  switch (req.url) {
    case "/":
      PATH = path.join(__dirname, PUBLIC_DIR, "index.html");
      break;
    default:
      PATH = path.join(__dirname, PUBLIC_DIR, req.url);
      break;
  }
  afs.stat(PATH).then(info => {
	  if (info.isFile()) {
		  fs.createReadStream(PATH).pipe(res);
	  } else {
		  next();
	  }
  }).catch(err => next());
}

/**
 *
 * @param {Router} router
 */
module.exports = function (router) {
  router.use(handlePublic);
};
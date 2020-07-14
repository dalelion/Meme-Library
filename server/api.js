const _ = require("lodash");
const formidable = require("formidable");
const Utils = require("../shared/utils");
const afs = require("./afs");
const MongoDB = require("./mongo");

function handleSearch(req, res, next) {
  MongoDB.Images().then(collection => {
    collection.find({tags: req.query.tags}).toArray().then(files => {
      res.writeHead(200, {'content-type': 'application/json'});
      res.end(JSON.stringify({files}, null, 2));
    });
  }).catch(Utils.error);
}

function handleUpload(req, res, next) {
  afs.stat("./Files").then(_.stubTrue).catch(_.stubFalse).then(exists => {
    if (exists) {
      return true;
    } else {
      return afs.mkdir("./Files", {recursive: true}).then(_.stubTrue).catch(_.stubFalse);
    }
  }).then(success => {
    form = formidable({
      multiples: true,
      keepExtensions: true,
      uploadDir: "./Files"
    });
    form.parse(req, (err, fields, values) => {
      let tags = _.compact(fields.tags.split(' '));
      if (!_.isArray(values.fileToUpload)) {
        values.fileToUpload = [values.fileToUpload];
      }
      MongoDB.Images().then(collection => {
        let files = _.transform(values.fileToUpload, (acc, file, key) => {
          acc.push({
            filepath: file.path,
            filename: file.name,
            mimetype: file.type,
            tags
          });
        }, []);
        collection.insertMany(files);
        res.writeHead(200, {'content-type': 'application/json'});
        res.end(JSON.stringify({
          fields,
          values
        }, null, 2));
      }).catch(Utils.error);
    });
  });
}

function handleDownload(req, res, next) {
  next();
}

/**
 *
 * @param {Router} router
 */
module.exports = function (router) {
  router.get("/file/:file_id", handleDownload);
  let files = router.route("/file");
  files.get(handleSearch);
  files.post(handleUpload);
};
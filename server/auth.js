const cookieParser = require("cookie-parser");
const handleCookies = cookieParser("memelibrary");
const {v4: uuidv4} = require("uuid");
const MongoDB = require("./mongo");

const MAX_AGE = 5 * 6e+4;

function handleAuth(req, res, next) {
  const EXPIRY = Date.now() + MAX_AGE;
  switch (req.method) {
    case "GET":
      res.setHeader("Content-Type", "application/json");
      MongoDB.Authentication().then(collection => {
        collection.findOne({_id: req.cookies.session_id}).then(row => {
          if (row && Date.now() < row.expireAt) {
            res.writeHead(200);
            res.end(JSON.stringify({
              user_id: null,
              status: "SUCCESS"
            }));
          } else {
            res.writeHead(401);
            res.end(JSON.stringify({status: "FAIL"}));
          }
        });
      });
      break;
    case "PUT":
      res.setHeader("Content-Type", "application/json");
      MongoDB.Authentication().then(collection => {
        collection.findOne({_id: req.cookies.session_id}).then(row => {
          if (row && Date.now() < row.expireAt) {
            const EXPIRES = new Date(EXPIRY);
            collection.updateOne({_id: req.cookies.session_id}, [{$set: {expireAt: EXPIRES}}], {upsert: true}).then(row => {
              res.setHeader("Set-Cookie", `session_id=${req.cookies.session_id}; Expires=${EXPIRES.toUTCString()}`);
              res.writeHead(200);
              res.end(JSON.stringify({
                user_id: null,
                status: "SUCCESS"
              }));
            });
          } else {
            res.writeHead(401);
            res.end(JSON.stringify({status: "FAIL"}));
          }
        });
      });
      break;
    case "POST":
      res.setHeader("Content-Type", "application/json");
      MongoDB.Authentication().then(collection => {
        collection.findOne({_id: req.cookies.session_id}).then(row => {
          if (row && Date.now() > row.expireAt) {
            res.writeHead(200);
            res.end(JSON.stringify({
              user_id: null,
              status: "SUCCESS"
            }));
          } else {
            const ID = uuidv4();
            const EXPIRES = new Date(EXPIRY);
            collection.insertOne({
              _id: ID,
              user_id: null,
              expireAt: EXPIRES
            }).then(result => {
              res.setHeader("Set-Cookie", `session_id=${ID}; Expires=${EXPIRES.toUTCString()}`);
              res.writeHead(200);
              res.end(JSON.stringify({
                user_id: null,
                status: "SUCCESS"
              }));
            });
          }
        });
      });
      break;
    case "DELETE":
      res.setHeader("Content-Type", "application/json");
      MongoDB.Authentication().then(collection => {
        collection.findOne({_id: req.cookies.session_id}).then(row => {
          if (row) {
            collection.deleteOne({_id: req.cookies.session_id}).then(result => {
              res.setHeader("Set-Cookie", `session_id=${req.cookies.session_id}; Expires=${new Date().toUTCString()}`);
              res.writeHead(200);
              res.end(JSON.stringify({
                user_id: null,
                status: "SUCCESS"
              }));
            });
          } else {
            res.writeHead(404);
            res.end(JSON.stringify({status: "FAIL"}));
          }
        });
      });
      break;
    default:
      next();
      break;
  }
}

/**
 *
 * @param {Router} router
 */
module.exports = function (router) {
	router.use(handleCookies);
	router.all("/auth", handleAuth);
};
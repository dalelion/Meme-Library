const mongo = require("mongodb");
const mongo_url = 'mongodb://localhost:27017';

/**
 * @returns {Promise<MongoClient>}
 */
async function connect() {
	return new Promise((resolve, reject) => {
		mongo.connect(mongo_url, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		}, (err, client) => {
			if (err) {
				reject(err);
			} else {
				resolve(client);
			}
		});
	});
}

/**
 * @returns {Promise<Db>}
 */
async function MemeLibrary() {
	return connect().then(client => client.db("MemeLibrary"));
}

/**
 * @returns {Promise<Collection>}
 */
async function Authentication() {
	return MemeLibrary().then(db => db.collection("Authentication").createIndex({"expireAt": 1}, {expireAfterSeconds: 0}).then(index => db.collection("Authentication")));
}

/**
 * @returns {Promise<Collection>}
 */
async function Users() {
	return MemeLibrary().then(db => db.collection("Users"));
}

/**
 * @returns {Promise<Collection>}
 */
async function Tags() {
	return MemeLibrary().then(db => db.collection("Tags"));
}

/**
 * @returns {Promise<Collection>}
 */
async function Images() {
	return MemeLibrary().then(db => db.collection("Images"));
}


module.exports = {
	connect,
	Authentication,
	Users,
	Images
};
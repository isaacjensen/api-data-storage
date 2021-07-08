/*
 * Module for working with a MongoDB connection.
 */

const { MongoClient } = require('mongodb');
const mongoHost = process.env.MONGO_HOST || 'localhost';
const mongoPort = process.env.MONGO_PORT || 27017;
const mongoUser = process.env.MONGO_USER;
const mongoPassword = process.env.MONGO_PASSWORD;
const mongoDBName = process.env.MONGO_DB_NAME;

const mongoUrl = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoDBName}`;
let db = null;
exports.connectToDb = function (callback) {
    MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, function(err,client) {
        if(err) {
            throw err;
        }
        db = client.db(mongoDBName);
        callback();
    });
};

exports.getDbReference = function() {
    return db;
}
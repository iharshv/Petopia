const { MongoClient } = require('mongodb');

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) {
        return cachedDb;
    }

    const uri = process.env.MONGODB_URI;

    if (!uri) {
        throw new Error('Please define MONGODB_URI environment variable');
    }

    const client = new MongoClient(uri);
    await client.connect();

    cachedClient = client;
    cachedDb = client.db('petopia');

    return cachedDb;
}

module.exports = { connectToDatabase };

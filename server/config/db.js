require('dotenv').config();
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  // Ignore DNS server set error if not supported in environment
}
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = 'realestate';

let db = null;
if (process.env.MONGO_URI || process.env.MONGODB_URI) {
  console.log("Connecting to:", (process.env.MONGO_URI || process.env.MONGODB_URI).replace(/:([^@]+)@/, ':****@'));
}

const connectDB = async () => {
  if (db) return db;
  try {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    console.log('MongoDB Connected Successfully');
    db = client.db(dbName);
    return db;
  } catch (error) {
    console.warn('MongoDB Connection Failed (will operate with fallback data):', error.message);
    db = null;
    return null;
  }
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not connected. Please check your MongoDB configuration.');
  }
  return db;
};

const isDBConnected = () => !!db;

module.exports = { connectDB, getDB, isDBConnected };

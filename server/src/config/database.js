const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tetris_dsa';
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[Database] MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn('[Database] Local MongoDB not detected. Activating In-Memory Persistence Engine (Hash Maps & Sorted Tables).');
  }
};

module.exports = connectDB;

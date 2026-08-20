const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');

  mongoose.connection.on('connected', () => console.log('[DB] MongoDB connected'));
  mongoose.connection.on('error', (err) => console.error('[DB] Connection error:', err.message));
  mongoose.connection.on('disconnected', () => console.warn('[DB] MongoDB disconnected'));

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
};

module.exports = connectDB;

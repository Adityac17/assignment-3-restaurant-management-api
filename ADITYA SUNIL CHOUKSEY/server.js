require('dotenv').config();

const mongoose = require('mongoose');
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const requiredEnv = ['MONGODB_URI', 'JWT_SECRET'];
const missing = requiredEnv.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`[FATAL] Missing environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const start = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`[SERVER] Listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
    });

    const shutdown = async (signal) => {
      console.log(`[SERVER] ${signal} received, shutting down`);
      server.close(async () => {
        await mongoose.connection.close();
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    console.error('[FATAL] Failed to start server:', err.message);
    process.exit(1);
  }
};

start();

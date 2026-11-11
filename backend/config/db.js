const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  // Ignore if not allowed
}
const mongoose = require('mongoose');

const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bakery_management';
  const localFallbackUri = 'mongodb://127.0.0.1:27017/bakery_management';

  try {
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 15000
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[MongoDB] Warning: Primary connection failed (${error.message})`);

    // If Atlas or remote cluster is blocked/not whitelisted, try local MongoDB fallback
    if (primaryUri !== localFallbackUri) {
      console.log('[MongoDB] Switching to local MongoDB server (mongodb://127.0.0.1:27017/bakery_management)...');
      try {
        const localConn = await mongoose.connect(localFallbackUri, {
          serverSelectionTimeoutMS: 5000
        });
        console.log(`[MongoDB] Connected successfully to local database: ${localConn.connection.host}`);
        return;
      } catch (localError) {
        console.error(`[MongoDB] Local connection also failed: ${localError.message}`);
      }
    }

    console.error(`[MongoDB] Error: Could not connect to database.`);
    process.exit(1);
  }
};

module.exports = connectDB;


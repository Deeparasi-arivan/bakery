const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');

async function testDirect() {
  const directUri = 'mongodb://deepadeeparasi17_db_user:scJhLXXpLM5U67Ep@ac-zyfoabl-shard-00-00.x8gkeot.mongodb.net:27017,ac-zyfoabl-shard-00-01.x8gkeot.mongodb.net:27017,ac-zyfoabl-shard-00-02.x8gkeot.mongodb.net:27017/bakery_management?ssl=true&replicaSet=atlas-zyfoabl-shard-0&authSource=admin&retryWrites=true&w=majority';
  console.log('Connecting to Atlas via direct replica set URI...');
  try {
    const conn = await mongoose.connect(directUri, { serverSelectionTimeoutMS: 8000 });
    console.log('✓ SUCCESS! Connected to MongoDB Atlas host:', conn.connection.host);

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`Collections in Atlas '${mongoose.connection.db.databaseName}':`);
    for (const c of collections) {
      const count = await mongoose.connection.db.collection(c.name).countDocuments();
      console.log(`- ${c.name}: ${count} documents`);
    }
  } catch (err) {
    console.error('Direct Connection Error:', err.message);
  }
  process.exit(0);
}

testDirect();


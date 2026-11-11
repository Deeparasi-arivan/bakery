const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');

async function checkAtlas() {
  const atlasUri = 'mongodb+srv://deepadeeparasi17_db_user:scJhLXXpLM5U67Ep@cluster0.x8gkeot.mongodb.net/bakery_management?retryWrites=true&w=majority&appName=Cluster0';
  console.log('Connecting to Atlas with 8.8.8.8 DNS...');
  try {
    await mongoose.connect(atlasUri, { serverSelectionTimeoutMS: 10000 });
    console.log('[Atlas] Connected successfully!');

    const admin = mongoose.connection.db.admin();
    const dbs = await admin.listDatabases();
    console.log('\n--- Databases in Atlas ---');
    dbs.databases.forEach(db => console.log(`- ${db.name}`));

    console.log(`\n--- Collections in Atlas '${mongoose.connection.db.databaseName}' ---`);
    const collections = await mongoose.connection.db.listCollections().toArray();
    for (const col of collections) {
      const count = await mongoose.connection.db.collection(col.name).countDocuments();
      console.log(`Collection: ${col.name.padEnd(20)} -> ${count} documents`);
    }
  } catch (err) {
    console.error('[Atlas Connection Error]:', err.message);
  }
  process.exit(0);
}

checkAtlas();

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');

const localUri = 'mongodb://127.0.0.1:27017/bakery_management';
const atlasUri = 'mongodb+srv://deepadeeparasi17_db_user:scJhLXXpLM5U67Ep@cluster0.x8gkeot.mongodb.net/bakery_management?retryWrites=true&w=majority&appName=Cluster0';

async function migrate() {
  console.log('[1/4] Connecting to Local MongoDB...');
  const localConn = await mongoose.createConnection(localUri).asPromise();
  console.log('✓ Connected to Local MongoDB');

  console.log('[2/4] Connecting to MongoDB Atlas...');
  const atlasConn = await mongoose.createConnection(atlasUri, { serverSelectionTimeoutMS: 15000 }).asPromise();
  console.log('✓ Connected to MongoDB Atlas Cloud');

  const collections = await localConn.db.listCollections().toArray();
  console.log(`[3/4] Found ${collections.length} collections to transfer...`);

  for (const col of collections) {
    const colName = col.name;
    const docs = await localConn.db.collection(colName).find({}).toArray();
    if (docs.length > 0) {
      await atlasConn.db.collection(colName).deleteMany({});
      await atlasConn.db.collection(colName).insertMany(docs);
      console.log(`  ✓ Successfully uploaded '${colName}': ${docs.length} documents into Atlas!`);
    } else {
      console.log(`  - '${colName}': 0 documents (skipped)`);
    }
  }

  console.log('\n[4/4] ALL DATA SUCCESSFULLY MIGRATED TO MONGODB ATLAS!');
  await localConn.close();
  await atlasConn.close();
  process.exit(0);
}

migrate().catch(err => {
  console.error('\n✗ Migration Failed:', err);
  process.exit(1);
});

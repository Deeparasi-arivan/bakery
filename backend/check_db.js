const mongoose = require('mongoose');

async function checkDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bakery_management';
  console.log('Connecting to:', uri);
  await mongoose.connect(uri);

  const admin = mongoose.connection.db.admin();
  const dbs = await admin.listDatabases();
  console.log('\n--- All Databases in MongoDB ---');
  dbs.databases.forEach(db => console.log(`- ${db.name} (${db.sizeOnDisk} bytes)`));

  console.log(`\n--- Collections in '${mongoose.connection.db.databaseName}' ---`);
  const collections = await mongoose.connection.db.listCollections().toArray();
  for (const col of collections) {
    const count = await mongoose.connection.db.collection(col.name).countDocuments();
    console.log(`Collection: ${col.name.padEnd(20)} -> ${count} documents`);
  }

  process.exit(0);
}

checkDB().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});


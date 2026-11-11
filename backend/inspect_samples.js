const mongoose = require('mongoose');

async function inspectCollections() {
  await mongoose.connect('mongodb://127.0.0.1:27017/bakery_management');

  const collections = ['customers', 'products', 'orders', 'owners', 'payments', 'shops'];
  for (const name of collections) {
    const docs = await mongoose.connection.db.collection(name).find({}).limit(2).toArray();
    console.log(`\n=== Collection '${name}' (Sample 2 docs) ===`);
    console.log(JSON.stringify(docs, null, 2));
  }

  process.exit(0);
}

inspectCollections();


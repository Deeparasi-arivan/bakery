const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');

async function verifyAtlasData() {
  const atlasUri = 'mongodb+srv://deepadeeparasi17_db_user:scJhLXXpLM5U67Ep@cluster0.x8gkeot.mongodb.net/bakery_management?retryWrites=true&w=majority&appName=Cluster0';
  await mongoose.connect(atlasUri, { serverSelectionTimeoutMS: 15000 });
  console.log('✓ Successfully connected to MongoDB Atlas!');

  const collections = ['products', 'categories', 'orders', 'customers', 'sales', 'shops', 'owners'];
  for (const name of collections) {
    const count = await mongoose.connection.db.collection(name).countDocuments();
    console.log(`Atlas Collection '${name}': ${count} documents`);
  }
  process.exit(0);
}

verifyAtlasData().catch(err => {
  console.error(err);
  process.exit(1);
});


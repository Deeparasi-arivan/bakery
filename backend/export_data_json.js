const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const exportDir = path.join('d:', 'bakery', 'mongodb_exports');

async function exportAll() {
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  await mongoose.connect('mongodb://127.0.0.1:27017/bakery_management');
  console.log('Connected to Local MongoDB. Starting export to:', exportDir);

  const collections = await mongoose.connection.db.listCollections().toArray();
  const summary = [];

  for (const col of collections) {
    const colName = col.name;
    const docs = await mongoose.connection.db.collection(colName).find({}).toArray();
    const filePath = path.join(exportDir, `${colName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(docs, null, 2), 'utf-8');
    summary.push({ collection: colName, count: docs.length, file: `${colName}.json` });
    console.log(`✓ Exported '${colName}': ${docs.length} documents -> ${filePath}`);
  }

  console.log('\n--- Export Complete Summary ---');
  console.table(summary);
  process.exit(0);
}

exportAll().catch(err => {
  console.error('Export Error:', err);
  process.exit(1);
});


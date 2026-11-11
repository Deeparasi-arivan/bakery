const mongoose = require('mongoose');

async function checkRecentCustomer() {
  await mongoose.connect('mongodb://127.0.0.1:27017/bakery_management');
  const customers = await mongoose.connection.db.collection('customers').find({}).toArray();
  console.log('All Customers in local DB:');
  customers.forEach(c => console.log(`- Name: ${c.name}, Phone: ${c.phone}, Email: ${c.email}, PasswordHash: ${c.password ? 'YES' : 'NO'}`));
  process.exit(0);
}

checkRecentCustomer();


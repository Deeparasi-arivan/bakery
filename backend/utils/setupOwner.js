const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Owner = require('../models/Owner');
const Shop = require('../models/Shop');

async function setupOwner() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully!');

    let shop = await Shop.findOne();
    if (!shop) {
      shop = await Shop.create({
        shopName: 'SweetHome Bakery & Patisserie',
        ownerName: 'Deepa Dhiya',
        contactNumber: '9042487448',
        email: 'owner@bakery.com',
        street: '42 Pastry Lane, Indiranagar',
        lane: '2nd Cross, Near Central Park',
        village: 'Halasuru',
        city: 'Bangalore',
        district: 'Bangalore Urban',
        state: 'Karnataka',
        pincode: '560038',
        isVerified: true
      });
      console.log('Created default shop:', shop.shopName);
    }

    // Check if owner with this phone exists
    let owner = await Owner.findOne({ phone: '9042487448' });

    if (!owner) {
      // Check if old default owner exists
      owner = await Owner.findOne({ email: 'owner@bakery.com' });
    }

    if (owner) {
      owner.name = 'Deepa Dhiya';
      owner.phone = '9042487448';
      owner.email = owner.email || 'owner@bakery.com';
      owner.password = 'deepadhiya';
      owner.shop = shop._id;
      owner.role = 'owner';
      await owner.save();
      console.log('Owner updated successfully with phone: 9042487448, password: deepadhiya');
    } else {
      owner = await Owner.create({
        name: 'Deepa Dhiya',
        email: 'owner@bakery.com',
        phone: '9042487448',
        password: 'deepadhiya',
        role: 'owner',
        shop: shop._id
      });
      console.log('Owner created successfully with phone: 9042487448, password: deepadhiya');
    }

    shop.owner = owner._id;
    await shop.save();

    console.log('Owner setup verified!');
    process.exit(0);
  } catch (error) {
    console.error('Setup Owner Error:', error.message);
    process.exit(1);
  }
}

setupOwner();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Owner = require('../models/Owner');
const Shop = require('../models/Shop');

const updateOwner = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bakery_management');
    console.log('[DB] Connected to MongoDB');

    const shop = await Shop.findOne();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('deepadhiya', salt);

    // Update or create Deepa Dhiya owner
    let owner = await Owner.findOne({
      $or: [{ phone: '9042487448' }, { email: 'owner@bakery.com' }]
    });

    if (owner) {
      owner.name = 'Deepa Dhiya';
      owner.email = 'owner@bakery.com';
      owner.phone = '9042487448';
      owner.password = hashedPassword;
      owner.role = 'owner';
      if (shop) owner.shop = shop._id;
      // Use updateOne to bypass pre-save double hashing if pre-save hashes it
      await Owner.updateOne(
        { _id: owner._id },
        {
          name: 'Deepa Dhiya',
          email: 'owner@bakery.com',
          phone: '9042487448',
          password: hashedPassword,
          role: 'owner',
          shop: shop ? shop._id : undefined
        }
      );
      console.log('[DB] Updated owner: Deepa Dhiya | 9042487448 | owner@bakery.com | deepadhiya');
    } else {
      await Owner.create({
        name: 'Deepa Dhiya',
        email: 'owner@bakery.com',
        phone: '9042487448',
        password: 'deepadhiya',
        role: 'owner',
        shop: shop ? shop._id : undefined
      });
      console.log('[DB] Created owner: Deepa Dhiya | 9042487448 | owner@bakery.com | deepadhiya');
    }

    // Also update shop owner reference
    const updatedOwner = await Owner.findOne({ phone: '9042487448' });
    if (shop && updatedOwner) {
      shop.ownerName = 'Deepa Dhiya';
      shop.owner = updatedOwner._id;
      await shop.save();
      console.log('[DB] Updated Shop owner reference to Deepa Dhiya');
    }

    // Also verify password match
    const testOwner = await Owner.findOne({ phone: '9042487448' });
    const isMatch = await bcrypt.compare('deepadhiya', testOwner.password);
    console.log('[Verify] Password "deepadhiya" matches:', isMatch);

    process.exit(0);
  } catch (err) {
    console.error('[Error]', err);
    process.exit(1);
  }
};

updateOwner();

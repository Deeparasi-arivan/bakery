const Shop = require('../models/Shop');
const Owner = require('../models/Owner');

// @desc    Register new shop or update existing
// @route   POST /api/shops
// @access  Private (Owner) or Public with owner linkage
exports.registerShop = async (req, res, next) => {
  try {
    const {
      shopName,
      ownerName,
      contactNumber,
      email,
      street,
      lane,
      village,
      city,
      district,
      state,
      pincode
    } = req.body;

    if (!shopName || !ownerName || !contactNumber || !email || !street || !city || !district || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all mandatory shop registration fields'
      });
    }

    let shopLogo = '/uploads/default-shop.png';
    if (req.files && req.files.shopLogo && req.files.shopLogo[0]) {
      shopLogo = `/uploads/${req.files.shopLogo[0].filename}`;
    } else if (req.body.shopLogo) {
      shopLogo = req.body.shopLogo;
    }

    const otherDocuments = [];
    if (req.files && req.files.otherDocuments) {
      req.files.otherDocuments.forEach((doc, idx) => {
        otherDocuments.push({
          title: req.body[`docTitle_${idx}`] || doc.originalname || `Document ${idx + 1}`,
          fileUrl: `/uploads/${doc.filename}`
        });
      });
    }

    const ownerId = req.user ? req.user._id : req.body.ownerId;

    // Check if shop already registered for this owner
    let shop;
    if (ownerId) {
      shop = await Shop.findOne({ owner: ownerId });
    }

    if (shop) {
      // Update existing shop
      shop.shopName = shopName;
      shop.ownerName = ownerName;
      shop.contactNumber = contactNumber;
      shop.email = email;
      shop.street = street;
      shop.lane = lane || shop.lane;
      shop.village = village || shop.village;
      shop.city = city;
      shop.district = district;
      shop.state = state;
      shop.pincode = pincode;
      if (req.files && req.files.shopLogo && req.files.shopLogo[0]) {
        shop.shopLogo = shopLogo;
      }
      if (otherDocuments.length > 0) {
        shop.otherDocuments.push(...otherDocuments);
      }
      await shop.save();
    } else {
      // Create new shop
      shop = await Shop.create({
        shopName,
        ownerName,
        owner: ownerId,
        shopLogo,
        contactNumber,
        email,
        street,
        lane,
        village,
        city,
        district,
        state,
        pincode,
        otherDocuments
      });

      if (ownerId) {
        await Owner.findByIdAndUpdate(ownerId, { shop: shop._id });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Shop registered successfully',
      shop
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Current Shop Details
// @route   GET /api/shops/current
// @access  Public
exports.getCurrentShop = async (req, res, next) => {
  try {
    let shop = null;
    if (req.user && req.user.role === 'owner') {
      shop = await Shop.findOne({ owner: req.user._id });
    }
    if (!shop) {
      shop = await Shop.findOne().sort({ createdAt: -1 });
    }

    if (!shop) {
      // Return default shop info if none created yet
      return res.status(200).json({
        success: true,
        shop: {
          shopName: 'SweetDelight Bakery & Cake Shop',
          ownerName: 'Master Pastry Chef',
          contactNumber: '+91 98765 43210',
          email: 'hello@sweetdelightbakery.com',
          street: '12 Bakery Boulevard',
          city: 'Bangalore',
          district: 'Bangalore Urban',
          state: 'Karnataka',
          pincode: '560001',
          shopLogo: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&auto=format&fit=crop&q=80'
        }
      });
    }

    res.status(200).json({
      success: true,
      shop
    });
  } catch (error) {
    next(error);
  }
};

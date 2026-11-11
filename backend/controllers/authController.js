const jwt = require('jsonwebtoken');
const Owner = require('../models/Owner');
const Customer = require('../models/Customer');
const Shop = require('../models/Shop');
const { generateOTP, sendOTP } = require('../services/smsService');

// Helper to generate JWT
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'supersecretbakeryjwtkey_2026_special_token',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Owner Login (Phone and/or Email + Password, or flexible identifier)
// @route   POST /api/auth/owner/login
exports.ownerLogin = async (req, res, next) => {
  try {
    const { identifier, phone, email, password } = req.body;

    const inputPhone = (phone || (!identifier?.includes('@') ? identifier : '') || '').trim();
    const inputEmail = (email || (identifier?.includes('@') ? identifier : '') || '').toLowerCase().trim();

    if (!inputPhone && !inputEmail) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your Phone number or Email ID'
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your password'
      });
    }

    // Build conditions to find the owner by phone or email
    const conditions = [];
    if (inputPhone) conditions.push({ phone: inputPhone });
    if (inputEmail) conditions.push({ email: inputEmail });

    const owner = await Owner.findOne({ $or: conditions }).populate('shop');

    if (!owner) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Owner account not found.'
      });
    }

    const isMatch = await owner.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.'
      });
    }

    const token = generateToken(owner._id, owner.role);

    res.status(200).json({
      success: true,
      message: 'Owner signed in successfully',
      token,
      user: {
        id: owner._id,
        name: owner.name,
        email: owner.email,
        phone: owner.phone,
        role: owner.role,
        shop: owner.shop
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Owner Send OTP (using phone and/or email)
// @route   POST /api/auth/owner/send-otp
exports.ownerSendOTP = async (req, res, next) => {
  try {
    const { phone, email } = req.body;
    const inputPhone = (phone || '').trim();
    const inputEmail = (email || '').toLowerCase().trim();

    if (!inputPhone && !inputEmail) {
      return res.status(400).json({
        success: false,
        message: 'Please provide registered phone number or email address'
      });
    }

    const conditions = [];
    if (inputPhone) conditions.push({ phone: inputPhone });
    if (inputEmail) conditions.push({ email: inputEmail });

    const owner = await Owner.findOne({ $or: conditions }).populate('shop');

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'No owner registered with this phone number or email address'
      });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    owner.otp = otp;
    owner.otpExpires = otpExpires;
    await owner.save();

    await sendOTP(owner.phone, otp);

    res.status(200).json({
      success: true,
      message: `OTP sent successfully to registered phone +91 ${owner.phone}`,
      phone: owner.phone,
      email: owner.email,
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Owner Verify OTP
// @route   POST /api/auth/owner/verify-otp
exports.ownerVerifyOTP = async (req, res, next) => {
  try {
    const { phone, email, otp } = req.body;
    const inputPhone = (phone || '').trim();
    const inputEmail = (email || '').toLowerCase().trim();

    if ((!inputPhone && !inputEmail) || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone/Email and OTP are required'
      });
    }

    const conditions = [];
    if (inputPhone) conditions.push({ phone: inputPhone });
    if (inputEmail) conditions.push({ email: inputEmail });

    const owner = await Owner.findOne({ $or: conditions }).populate('shop');

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'Owner account not found'
      });
    }

    if (owner.otp !== otp.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please check and try again.'
      });
    }

    if (owner.otpExpires && owner.otpExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    owner.otp = undefined;
    owner.otpExpires = undefined;
    await owner.save();

    const token = generateToken(owner._id, owner.role);

    res.status(200).json({
      success: true,
      message: 'Owner signed in successfully via OTP',
      token,
      user: {
        id: owner._id,
        name: owner.name,
        email: owner.email,
        phone: owner.phone,
        role: owner.role,
        shop: owner.shop
      }
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Owner Register (Creates Owner account & Auto-Links Shop)
// @route   POST /api/auth/owner/register
exports.ownerRegister = async (req, res, next) => {
  try {
    const { name, email, phone, password, shopName } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: Name, Email, Phone, and Password'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanPhone = phone.replace(/\D/g, '').trim();

    if (cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit mobile number'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const existingOwner = await Owner.findOne({
      $or: [{ email: cleanEmail }, { phone: cleanPhone }]
    });

    if (existingOwner) {
      return res.status(400).json({
        success: false,
        message: 'An owner account with this email or phone number already exists. Please Sign In.'
      });
    }

    const owner = await Owner.create({
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      password,
      role: 'owner'
    });

    // Auto-create initial Shop for owner if provided or default
    try {
      const shop = await Shop.create({
        shopName: shopName?.trim() || `${name.trim()}'s Bakery & Patisserie`,
        ownerName: name.trim(),
        owner: owner._id,
        contactNumber: cleanPhone,
        email: cleanEmail,
        street: 'Main Commercial Road',
        city: 'Bangalore',
        district: 'Bangalore Urban',
        state: 'Karnataka',
        pincode: '560001'
      });
      owner.shop = shop._id;
      await owner.save();
    } catch (shopErr) {
      console.warn('Could not auto-create shop for new owner:', shopErr.message);
    }

    const token = generateToken(owner._id, owner.role);

    res.status(201).json({
      success: true,
      message: 'Owner account registered successfully! Welcome to your management portal.',
      token,
      user: {
        id: owner._id,
        name: owner.name,
        email: owner.email,
        phone: owner.phone,
        role: owner.role,
        shop: owner.shop
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Customer Sign In / Login (Phone or Email + Password)
// @route   POST /api/auth/customer/login
exports.customerLogin = async (req, res, next) => {
  try {
    const { identifier, phone, email, password } = req.body;

    const inputPhone = (phone || (!identifier?.includes('@') ? identifier : '') || '').replace(/\D/g, '').trim();
    const inputEmail = (email || (identifier?.includes('@') ? identifier : '') || '').toLowerCase().trim();

    if (!inputPhone && !inputEmail) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your Mobile Number or Email ID'
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your password'
      });
    }

    const conditions = [];
    if (inputPhone && inputPhone.length >= 10) conditions.push({ phone: inputPhone });
    if (inputEmail && inputEmail.includes('@')) conditions.push({ email: inputEmail });

    if (conditions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit mobile number or email address'
      });
    }

    const customer = await Customer.findOne({ $or: conditions });

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'No account found with this Mobile Number or Email. Please Sign Up first.'
      });
    }

    if (!customer.password) {
      return res.status(401).json({
        success: false,
        message: 'Password not set for this account. Please go to Sign Up to create your password.'
      });
    }

    const isMatch = await customer.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please check and try again.'
      });
    }

    const token = generateToken(customer._id, customer.role);

    res.status(200).json({
      success: true,
      message: 'Signed in successfully! Welcome back to SweetDelight.',
      token,
      user: {
        id: customer._id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        role: customer.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Customer Sign Up / Register (Name, Phone, Email, Password)
// @route   POST /api/auth/customer/register
exports.customerRegister = async (req, res, next) => {
  try {
    const { name, phone, email, password } = req.body;

    const cleanPhone = (phone || '').replace(/\D/g, '').trim();
    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanName = (name || '').trim();

    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit mobile number'
      });
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if customer already exists with this phone or email
    let customer = await Customer.findOne({
      $or: [{ phone: cleanPhone }, { email: cleanEmail }]
    });

    if (customer) {
      if (customer.password) {
        return res.status(400).json({
          success: false,
          message: 'An account with this Mobile Number or Email already exists. Please Sign In.'
        });
      }

      // If legacy customer without password, update and set password
      customer.name = cleanName || customer.name || 'Valued Customer';
      customer.phone = cleanPhone;
      customer.email = cleanEmail;
      customer.password = password;
      customer.isVerified = true;
      await customer.save();
    } else {
      customer = await Customer.create({
        name: cleanName || 'Valued Customer',
        phone: cleanPhone,
        email: cleanEmail,
        password,
        role: 'customer',
        isVerified: true
      });
    }

    const token = generateToken(customer._id, customer.role);

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to SweetDelight.',
      token,
      user: {
        id: customer._id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        role: customer.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Customer Login (Mobile or Email + Password)
// @route   POST /api/auth/customer/login
exports.customerLogin = async (req, res, next) => {
  try {
    const { identifier, phone, email, password } = req.body;

    const input = (identifier || phone || email || '').trim();
    if (!input || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your mobile number or email, and your password'
      });
    }

    const isEmail = input.includes('@');
    let customer;

    if (isEmail) {
      customer = await Customer.findOne({ email: input.toLowerCase() });
    } else {
      const cleanedDigits = input.replace(/\D/g, '');
      const searchPhone = cleanedDigits.length === 10 ? cleanedDigits : input;
      customer = await Customer.findOne({
        $or: [
          { phone: searchPhone },
          { phone: input }
        ]
      });
    }

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Account not found. Please check your mobile/email or Sign Up.'
      });
    }

    if (!customer.password) {
      return res.status(400).json({
        success: false,
        message: 'No password has been set for this account. Please Sign Up to set your password.'
      });
    }

    const isMatch = await customer.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password. Please check and try again.'
      });
    }

    const token = generateToken(customer._id, customer.role);

    res.status(200).json({
      success: true,
      message: 'Signed in successfully!',
      token,
      user: {
        id: customer._id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        role: customer.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Customer Register (Mobile, Email, Password, Name)
// @route   POST /api/auth/customer/register
exports.customerRegister = async (req, res, next) => {
  try {
    const { name, phone, email, password } = req.body;

    const cleanedPhone = (phone || '').replace(/\D/g, '').trim();
    const cleanedEmail = (email || '').toLowerCase().trim();

    if (!cleanedPhone || cleanedPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit mobile number'
      });
    }

    if (!cleanedEmail) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address format'
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if phone or email already exists
    let existingCustomer = await Customer.findOne({
      $or: [
        { phone: cleanedPhone },
        { email: cleanedEmail }
      ]
    });

    if (existingCustomer) {
      if (existingCustomer.password) {
        if (existingCustomer.phone === cleanedPhone) {
          return res.status(400).json({
            success: false,
            message: 'An account with this mobile number already exists. Please Sign In.'
          });
        }
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists. Please Sign In.'
        });
      } else {
        // Legacy customer without password -> activate password
        existingCustomer.password = password;
        if (name && (!existingCustomer.name || existingCustomer.name === 'Valued Customer')) {
          existingCustomer.name = name.trim();
        }
        if (cleanedEmail && !existingCustomer.email) {
          existingCustomer.email = cleanedEmail;
        }
        existingCustomer.isVerified = true;
        await existingCustomer.save();

        const token = generateToken(existingCustomer._id, existingCustomer.role);
        return res.status(200).json({
          success: true,
          message: 'Account activated and signed in successfully!',
          token,
          user: {
            id: existingCustomer._id,
            name: existingCustomer.name,
            phone: existingCustomer.phone,
            email: existingCustomer.email,
            role: existingCustomer.role
          }
        });
      }
    }

    // Create new customer
    const newCustomer = await Customer.create({
      phone: cleanedPhone,
      email: cleanedEmail,
      name: name?.trim() || 'Valued Customer',
      password,
      isVerified: true,
      role: 'customer'
    });

    const token = generateToken(newCustomer._id, newCustomer.role);

    res.status(201).json({
      success: true,
      message: 'Account created and signed in successfully! Welcome.',
      token,
      user: {
        id: newCustomer._id,
        name: newCustomer.name,
        phone: newCustomer.phone,
        email: newCustomer.email,
        role: newCustomer.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Customer Send OTP
// @route   POST /api/auth/customer/send-otp
exports.customerSendOTP = async (req, res, next) => {
  try {
    const { phone } = req.body;

    if (!phone || phone.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit mobile number'
      });
    }

    const cleanedPhone = phone.trim();
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    let customer = await Customer.findOne({ phone: cleanedPhone });
    if (!customer) {
      customer = await Customer.create({
        phone: cleanedPhone,
        otp,
        otpExpires,
        isVerified: false
      });
    } else {
      customer.otp = otp;
      customer.otpExpires = otpExpires;
      await customer.save();
    }

    // Send via SMS service (mock logs to console)
    await sendOTP(cleanedPhone, otp);

    res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${cleanedPhone}`,
      phone: cleanedPhone,
      // For development convenience:
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Customer Verify OTP
// @route   POST /api/auth/customer/verify-otp
exports.customerVerifyOTP = async (req, res, next) => {
  try {
    const { phone, otp, name } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required'
      });
    }

    const customer = await Customer.findOne({ phone: phone.trim() });
    if (!customer) {
      return res.status(400).json({
        success: false,
        message: 'No OTP request found for this phone number'
      });
    }

    // Verify OTP and expiry
    if (customer.otp !== otp.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please check and try again.'
      });
    }

    if (customer.otpExpires && customer.otpExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Mark as verified & optionally update name
    customer.isVerified = true;
    customer.otp = undefined;
    customer.otpExpires = undefined;
    if (name && (!customer.name || customer.name === 'Valued Customer')) {
      customer.name = name;
    }
    await customer.save();

    const token = generateToken(customer._id, customer.role);

    res.status(200).json({
      success: true,
      message: 'Mobile number verified successfully',
      token,
      user: {
        id: customer._id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        role: customer.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Current User Profile
// @route   GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    let shop = null;
    if (req.user.role === 'owner' || req.user.role === 'admin') {
      shop = await Shop.findOne({ owner: req.user._id });
    }

    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        shop
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Customer Profile
// @route   PUT /api/auth/customer/profile
exports.updateCustomerProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const customer = await Customer.findById(req.user._id);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    if (name) customer.name = name;
    if (email) customer.email = email;
    await customer.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: customer._id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        role: customer.role
      }
    });
  } catch (error) {
    next(error);
  }
};

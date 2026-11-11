const jwt = require('jsonwebtoken');
const Owner = require('../models/Owner');
const Customer = require('../models/Customer');

// Protect routes - requires valid JWT
const verifyToken = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route, no token provided'
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'supersecretbakeryjwtkey_2026_special_token'
    );

    if (decoded.role === 'owner' || decoded.role === 'admin') {
      const owner = await Owner.findById(decoded.id).select('-password');
      if (!owner) {
        return res.status(401).json({
          success: false,
          message: 'Owner account not found'
        });
      }
      req.user = owner;
      req.user.role = decoded.role;
    } else {
      const customer = await Customer.findById(decoded.id);
      if (!customer) {
        return res.status(401).json({
          success: false,
          message: 'Customer account not found'
        });
      }
      req.user = customer;
      req.user.role = 'customer';
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: error.message
    });
  }
};

// Owner or Admin only
const isOwner = (req, res, next) => {
  if (req.user && (req.user.role === 'owner' || req.user.role === 'admin')) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Owner privileges required'
    });
  }
};

// Customer (also permits Owner/Admin when shopping or testing orders)
const isCustomer = (req, res, next) => {
  if (req.user && (req.user.role === 'customer' || req.user.role === 'owner' || req.user.role === 'admin')) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Customer privileges required'
    });
  }
};

module.exports = {
  verifyToken,
  isOwner,
  isCustomer
};

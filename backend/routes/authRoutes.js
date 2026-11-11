const express = require('express');
const router = express.Router();
const {
  ownerLogin,
  ownerRegister,
  ownerSendOTP,
  ownerVerifyOTP,
  customerSendOTP,
  customerVerifyOTP,
  customerLogin,
  customerRegister,
  getMe,
  updateCustomerProfile
} = require('../controllers/authController');
const { verifyToken, isCustomer } = require('../middleware/auth');

router.post('/owner/login', ownerLogin);
router.post('/owner/send-otp', ownerSendOTP);
router.post('/owner/verify-otp', ownerVerifyOTP);
router.post('/owner/register', ownerRegister);
router.post('/customer/login', customerLogin);
router.post('/customer/register', customerRegister);
router.post('/customer/send-otp', customerSendOTP);
router.post('/customer/verify-otp', customerVerifyOTP);
router.get('/me', verifyToken, getMe);
router.put('/customer/profile', verifyToken, isCustomer, updateCustomerProfile);

module.exports = router;

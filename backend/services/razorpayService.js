const Razorpay = require('razorpay');
const crypto = require('crypto');

let razorpayInstance = null;

const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!razorpayInstance && key_id && key_secret) {
    try {
      razorpayInstance = new Razorpay({
        key_id,
        key_secret
      });
    } catch (err) {
      console.warn('[Razorpay] Initialization warning:', err.message);
    }
  }
  return razorpayInstance;
};

/**
 * Create a Razorpay Order
 * @param {number} amount - in Rupees
 * @param {string} receipt - receipt identifier
 */
const createRazorpayOrder = async (amount, receipt) => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  const instance = getRazorpayInstance();

  // If live or valid test Razorpay keys are available, invoke Razorpay SDK
  if (instance && key_id && key_secret && !key_id.includes('123456')) {
    try {
      const options = {
        amount: Math.round(amount * 100), // amount in lowest currency unit (paise)
        currency: 'INR',
        receipt: receipt || `rcpt_${Date.now()}`
      };
      const order = await instance.orders.create(options);
      return {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        key: key_id,
        isMock: false
      };
    } catch (error) {
      console.warn('[Razorpay API Warning] Falling back to development mock order:', error.message);
    }
  }

  // Development mock order generator for seamless local testing
  const mockOrderId = `order_mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  return {
    id: mockOrderId,
    amount: Math.round(amount * 100),
    currency: 'INR',
    key: key_id || 'rzp_test_mock_bakery',
    isMock: true
  };
};

/**
 * Verify Razorpay Payment Signature
 */
const verifyPaymentSignature = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  // If mock order, permit dev verification
  if (razorpayOrderId.startsWith('order_mock_')) {
    return true;
  }

  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_secret) {
    return false;
  }

  try {
    const generatedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    return generatedSignature === razorpaySignature;
  } catch (err) {
    console.error('[Razorpay Signature Error]', err);
    return false;
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPaymentSignature
};

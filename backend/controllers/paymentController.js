const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Sale = require('../models/Sale');
const { createRazorpayOrder, verifyPaymentSignature } = require('../services/razorpayService');

// @desc    Create Razorpay Order for checkout
// @route   POST /api/payments/create-order
// @access  Private (Customer)
exports.createOrder = async (req, res, next) => {
  try {
    const { amount, receipt } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }

    const orderData = await createRazorpayOrder(Number(amount), receipt || `rcpt_${Date.now()}`);

    res.status(200).json({
      success: true,
      order: orderData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay payment signature & update order
// @route   POST /api/payments/verify
// @access  Private (Customer)
exports.verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      orderId
    } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment details are missing'
      });
    }

    const isValid = verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid signature'
      });
    }

    // Update order and payment record
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.paymentStatus = 'Completed';
    order.orderStatus = 'Confirmed';
    order.statusHistory.push({
      status: 'Confirmed',
      timestamp: new Date(),
      comment: `Online payment verified successfully (Payment ID: ${razorpayPaymentId})`
    });

    // Record payment document
    const payment = await Payment.create({
      order: order._id,
      customer: req.user._id,
      amount: order.totalAmount,
      currency: 'INR',
      paymentMethod: 'RAZORPAY',
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      status: 'Captured'
    });

    order.payment = payment._id;
    await order.save();

    // Record sale
    await Sale.create({
      order: order._id,
      orderNumber: order.orderNumber,
      customer: req.user._id,
      customerName: order.deliveryAddress.name,
      amount: order.totalAmount,
      paymentMethod: 'RAZORPAY',
      itemsCount: order.items.reduce((s, it) => s + it.quantity, 0),
      date: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified and order confirmed successfully',
      order,
      payment
    });
  } catch (error) {
    next(error);
  }
};

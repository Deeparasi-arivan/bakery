const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
} = require('../controllers/orderController');
const { verifyToken, isOwner, isCustomer } = require('../middleware/auth');

router.post('/', verifyToken, isCustomer, createOrder);
router.get('/my-orders', verifyToken, isCustomer, getMyOrders);
router.get('/', verifyToken, isOwner, getAllOrders);
router.get('/:id', verifyToken, getOrderById);
router.put('/:id/status', verifyToken, isOwner, updateOrderStatus);
router.put('/:id/cancel', verifyToken, cancelOrder);

module.exports = router;

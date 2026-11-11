const express = require('express');
const router = express.Router();
const {
  getStockOverview,
  updateProductStock,
  getStockHistory
} = require('../controllers/stockController');
const { verifyToken, isOwner } = require('../middleware/auth');

router.get('/', verifyToken, isOwner, getStockOverview);
router.put('/:productId', verifyToken, isOwner, updateProductStock);
router.get('/history', verifyToken, isOwner, getStockHistory);

module.exports = router;

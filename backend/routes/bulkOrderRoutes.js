const express = require('express');
const router = express.Router();
const {
  createBulkOrder,
  getBulkOrders,
  updateBulkOrder,
  deleteBulkOrder
} = require('../controllers/bulkOrderController');
const { verifyToken, isOwner } = require('../middleware/auth');

router.post('/', createBulkOrder); // Public or Customer
router.get('/', verifyToken, isOwner, getBulkOrders);
router.put('/:id', verifyToken, isOwner, updateBulkOrder);
router.delete('/:id', verifyToken, isOwner, deleteBulkOrder);

module.exports = router;

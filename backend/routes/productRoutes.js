const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { verifyToken, isOwner } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', verifyToken, isOwner, upload.single('image'), createProduct);
router.put('/:id', verifyToken, isOwner, upload.single('image'), updateProduct);
router.delete('/:id', verifyToken, isOwner, deleteProduct);

module.exports = router;

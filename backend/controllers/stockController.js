const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');

// @desc    Get inventory summary & low stock alerts
// @route   GET /api/stock
// @access  Private (Owner)
exports.getStockOverview = async (req, res, next) => {
  try {
    const products = await Product.find()
      .populate('category', 'name')
      .sort({ stock: 1 });

    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
    const lowStockProducts = products.filter(p => p.stock <= (p.lowStockThreshold || 5));
    const outOfStockProducts = products.filter(p => p.stock === 0);

    res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        totalStock,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length
      },
      lowStockProducts,
      products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add or Update Stock for a product
// @route   PUT /api/stock/:productId
// @access  Private (Owner)
exports.updateProductStock = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { actionType, quantity, reason } = req.body; // actionType: 'ADD', 'SET', 'DEDUCT'

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const qtyNumber = Number(quantity);
    if (isNaN(qtyNumber) || qtyNumber <= 0) {
      return res.status(400).json({ success: false, message: 'Valid positive quantity required' });
    }

    const previousStock = product.stock;
    let newStock = previousStock;
    let movementType = 'ADJUSTMENT';

    if (actionType === 'ADD') {
      newStock = previousStock + qtyNumber;
      movementType = 'IN';
    } else if (actionType === 'DEDUCT') {
      if (previousStock < qtyNumber) {
        return res.status(400).json({
          success: false,
          message: `Cannot deduct ${qtyNumber}. Current stock is only ${previousStock}`
        });
      }
      newStock = previousStock - qtyNumber;
      movementType = 'OUT';
    } else if (actionType === 'SET') {
      newStock = qtyNumber;
      movementType = newStock > previousStock ? 'IN' : 'ADJUSTMENT';
    }

    product.stock = newStock;
    // Auto update availability if stock becomes 0 or positive
    if (newStock === 0) {
      product.isAvailable = false;
    } else if (!product.isAvailable && newStock > 0) {
      product.isAvailable = true;
    }
    await product.save();

    // Log movement history
    const movement = await StockMovement.create({
      product: product._id,
      type: movementType,
      quantity: Math.abs(newStock - previousStock),
      previousStock,
      newStock,
      reason: reason || `Manual Stock Update (${actionType})`,
      performedBy: req.user ? req.user._id : undefined
    });

    res.status(200).json({
      success: true,
      message: `Stock updated for ${product.name}. New stock: ${newStock}`,
      product,
      movement
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Stock History / Movement Audit Logs
// @route   GET /api/stock/history
// @access  Private (Owner)
exports.getStockHistory = async (req, res, next) => {
  try {
    const { productId, limit = 50 } = req.query;
    const query = {};
    if (productId) {
      query.product = productId;
    }

    const history = await StockMovement.find(query)
      .populate('product', 'name image price category')
      .populate('performedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: history.length,
      history
    });
  } catch (error) {
    next(error);
  }
};

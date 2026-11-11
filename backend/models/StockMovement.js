const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['IN', 'OUT', 'ADJUSTMENT', 'SALE', 'RETURN'],
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    previousStock: {
      type: Number,
      required: true
    },
    newStock: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      default: 'Inventory Update'
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Owner'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('StockMovement', stockMovementSchema);

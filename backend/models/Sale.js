const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    orderNumber: {
      type: String
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer'
    },
    customerName: {
      type: String,
      default: 'Guest Customer'
    },
    amount: {
      type: Number,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'RAZORPAY', 'CASH', 'UPI', 'CARD'],
      default: 'COD'
    },
    itemsCount: {
      type: Number,
      default: 1
    },
    date: {
      type: Date,
      default: Date.now,
      index: true
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

saleSchema.index({ date: -1 });

module.exports = mongoose.model('Sale', saleSchema);

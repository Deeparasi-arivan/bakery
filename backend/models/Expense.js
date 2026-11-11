const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, 'Expense category is required'],
      enum: [
        'Ingredients',
        'Packaging',
        'Utilities',
        'Rent',
        'Equipment',
        'Salaries',
        'Marketing',
        'Maintenance',
        'Other'
      ],
      default: 'Ingredients'
    },
    amount: {
      type: Number,
      required: [true, 'Expense amount is required'],
      min: [0, 'Amount must be positive']
    },
    date: {
      type: Date,
      default: Date.now,
      index: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    receiptImage: {
      type: String,
      default: ''
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Owner'
    }
  },
  {
    timestamps: true
  }
);

expenseSchema.index({ date: -1 });

module.exports = mongoose.model('Expense', expenseSchema);

const mongoose = require('mongoose');

const bulkOrderSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    eventType: {
      type: String,
      enum: ['Birthday', 'Wedding', 'Corporate', 'Anniversary', 'Party', 'Other'],
      default: 'Birthday'
    },
    eventDate: {
      type: Date,
      required: [true, 'Event date is required']
    },
    requiredItems: {
      type: String,
      required: [true, 'Description of cake / items requested is required']
    },
    estimatedBudget: {
      type: Number,
      default: 0
    },
    advanceAmount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['Inquiry', 'Quoted', 'Confirmed', 'In Progress', 'Completed', 'Declined'],
      default: 'Inquiry',
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

module.exports = mongoose.model('BulkOrder', bulkOrderSchema);

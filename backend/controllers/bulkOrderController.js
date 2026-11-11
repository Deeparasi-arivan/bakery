const BulkOrder = require('../models/BulkOrder');

// @desc    Submit Bulk Order Inquiry (Public / Customer)
// @route   POST /api/bulk-orders
exports.createBulkOrder = async (req, res, next) => {
  try {
    const {
      customerName,
      contactNumber,
      email,
      eventType,
      eventDate,
      requiredItems,
      estimatedBudget,
      notes
    } = req.body;

    if (!customerName || !contactNumber || !eventDate || !requiredItems) {
      return res.status(400).json({
        success: false,
        message: 'Name, Contact Number, Event Date, and Required Items are mandatory'
      });
    }

    const bulkOrder = await BulkOrder.create({
      customerName,
      contactNumber,
      email,
      eventType: eventType || 'Birthday',
      eventDate: new Date(eventDate),
      requiredItems,
      estimatedBudget: Number(estimatedBudget) || 0,
      status: 'Inquiry',
      notes: notes || ''
    });

    res.status(201).json({
      success: true,
      message: 'Your bulk order inquiry has been received! Our bakery team will contact you shortly.',
      bulkOrder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bulk orders (Owner)
// @route   GET /api/bulk-orders
// @access  Private (Owner)
exports.getBulkOrders = async (req, res, next) => {
  try {
    const { status, eventType } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (eventType && eventType !== 'all') {
      query.eventType = eventType;
    }

    const bulkOrders = await BulkOrder.find(query).sort({ eventDate: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bulkOrders.length,
      bulkOrders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update bulk order status & quotes (Owner)
// @route   PUT /api/bulk-orders/:id
// @access  Private (Owner)
exports.updateBulkOrder = async (req, res, next) => {
  try {
    const { status, advanceAmount, estimatedBudget, notes } = req.body;

    const bulkOrder = await BulkOrder.findById(req.params.id);
    if (!bulkOrder) {
      return res.status(404).json({ success: false, message: 'Bulk order inquiry not found' });
    }

    if (status) bulkOrder.status = status;
    if (advanceAmount !== undefined) bulkOrder.advanceAmount = Number(advanceAmount);
    if (estimatedBudget !== undefined) bulkOrder.estimatedBudget = Number(estimatedBudget);
    if (notes !== undefined) bulkOrder.notes = notes;

    await bulkOrder.save();

    res.status(200).json({
      success: true,
      message: 'Bulk order updated successfully',
      bulkOrder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete bulk order inquiry (Owner)
// @route   DELETE /api/bulk-orders/:id
// @access  Private (Owner)
exports.deleteBulkOrder = async (req, res, next) => {
  try {
    const bulkOrder = await BulkOrder.findByIdAndDelete(req.params.id);
    if (!bulkOrder) {
      return res.status(404).json({ success: false, message: 'Bulk order not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Bulk order deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

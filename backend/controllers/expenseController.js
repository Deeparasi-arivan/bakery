const Expense = require('../models/Expense');

// @desc    Get all expenses (with category and date filters)
// @route   GET /api/expenses
// @access  Private (Owner)
exports.getExpenses = async (req, res, next) => {
  try {
    const { category, startDate, endDate, page = 1, limit = 50 } = req.query;
    const query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [expenses, total, aggregateTotal] = await Promise.all([
      Expense.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Expense.countDocuments(query),
      Expense.aggregate([
        { $match: query },
        { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
      ])
    ]);

    const totalExpenseAmount = aggregateTotal.length > 0 ? aggregateTotal[0].totalAmount : 0;

    res.status(200).json({
      success: true,
      totalExpenseAmount,
      count: expenses.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      expenses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new expense
// @route   POST /api/expenses
// @access  Private (Owner)
exports.createExpense = async (req, res, next) => {
  try {
    const { category, amount, date, description, receiptImage } = req.body;

    if (!category || amount === undefined || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Category and a valid positive amount are required'
      });
    }

    const expense = await Expense.create({
      category,
      amount: Number(amount),
      date: date ? new Date(date) : new Date(),
      description: description || '',
      receiptImage: receiptImage || '',
      recordedBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Expense recorded successfully',
      expense
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private (Owner)
exports.updateExpense = async (req, res, next) => {
  try {
    const { category, amount, date, description } = req.body;

    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    if (category) expense.category = category;
    if (amount !== undefined) expense.amount = Number(amount);
    if (date) expense.date = new Date(date);
    if (description !== undefined) expense.description = description;

    await expense.save();

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      expense
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private (Owner)
exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

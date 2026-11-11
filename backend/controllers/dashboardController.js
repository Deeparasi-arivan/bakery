const Product = require('../models/Product');
const Order = require('../models/Order');
const Sale = require('../models/Sale');
const Expense = require('../models/Expense');

// @desc    Get Owner Dashboard Statistics
// @route   GET /api/dashboard
// @access  Private (Owner)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalProducts,
      availableStockAgg,
      todaySalesAgg,
      totalSalesAgg,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalExpensesAgg,
      recentOrders,
      lowStockProducts
    ] = await Promise.all([
      Product.countDocuments(),
      Product.aggregate([
        { $group: { _id: null, totalStock: { $sum: '$stock' } } }
      ]),
      Sale.aggregate([
        { $match: { date: { $gte: todayStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Sale.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: { $in: ['Pending', 'Confirmed', 'Preparing'] } }),
      Order.countDocuments({ orderStatus: 'Delivered' }),
      Expense.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Order.find()
        .populate('customer', 'name phone')
        .sort({ createdAt: -1 })
        .limit(6),
      Product.find({ stock: { $lte: 5 } })
        .populate('category', 'name')
        .limit(6)
    ]);

    const availableStock = availableStockAgg.length > 0 ? availableStockAgg[0].totalStock : 0;
    const todaySales = todaySalesAgg.length > 0 ? todaySalesAgg[0].total : 0;
    const totalSales = totalSalesAgg.length > 0 ? totalSalesAgg[0].total : 0;
    const totalExpenses = totalExpensesAgg.length > 0 ? totalExpensesAgg[0].total : 0;
    const estimatedProfit = Math.max(0, totalSales - totalExpenses);

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        availableStock,
        todaySales,
        totalSales,
        totalOrders,
        pendingOrders,
        completedOrders,
        totalExpenses,
        estimatedProfit
      },
      recentOrders,
      lowStockProducts
    });
  } catch (error) {
    next(error);
  }
};

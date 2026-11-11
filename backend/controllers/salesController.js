const Sale = require('../models/Sale');

// @desc    Get sales with date filters and summary calculations
// @route   GET /api/sales
// @access  Private (Owner)
exports.getSales = async (req, res, next) => {
  try {
    const { filter = 'all', startDate, endDate, paymentMethod, page = 1, limit = 50 } = req.query;
    const query = {};

    const now = new Date();

    if (filter === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      query.date = { $gte: startOfDay };
    } else if (filter === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      query.date = { $gte: oneWeekAgo };
    } else if (filter === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      query.date = { $gte: startOfMonth };
    } else if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    if (paymentMethod && paymentMethod !== 'all') {
      query.paymentMethod = paymentMethod;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [sales, totalSalesCount, aggregateStats] = await Promise.all([
      Sale.find(query)
        .populate('order', 'orderNumber orderStatus items')
        .sort({ date: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Sale.countDocuments(query),
      Sale.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$amount' },
            totalItems: { $sum: '$itemsCount' },
            averageSale: { $avg: '$amount' }
          }
        }
      ])
    ]);

    const stats = aggregateStats.length > 0 ? aggregateStats[0] : { totalRevenue: 0, totalItems: 0, averageSale: 0 };

    res.status(200).json({
      success: true,
      stats: {
        totalRevenue: stats.totalRevenue || 0,
        totalItemsSold: stats.totalItems || 0,
        averageSaleAmount: Math.round(stats.averageSale || 0),
        totalTransactions: totalSalesCount
      },
      sales,
      total: totalSalesCount,
      page: Number(page),
      pages: Math.ceil(totalSalesCount / Number(limit))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Sales Summary for Charts & Quick Stats
// @route   GET /api/sales/summary
// @access  Private (Owner)
exports.getSalesSummary = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [todaySales, allTimeSales, salesByPaymentMethod] = await Promise.all([
      Sale.aggregate([
        { $match: { date: { $gte: todayStart } } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      Sale.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      Sale.aggregate([
        { $group: { _id: '$paymentMethod', total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ])
    ]);

    res.status(200).json({
      success: true,
      todayRevenue: todaySales.length > 0 ? todaySales[0].total : 0,
      todayCount: todaySales.length > 0 ? todaySales[0].count : 0,
      allTimeRevenue: allTimeSales.length > 0 ? allTimeSales[0].total : 0,
      allTimeCount: allTimeSales.length > 0 ? allTimeSales[0].count : 0,
      byPaymentMethod: salesByPaymentMethod
    });
  } catch (error) {
    next(error);
  }
};

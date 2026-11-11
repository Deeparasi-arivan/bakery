const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Address = require('../models/Address');
const StockMovement = require('../models/StockMovement');
const Sale = require('../models/Sale');

// Generate unique order number (e.g. BK-20261013-1001)
const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `BK-${dateStr}-${randomSuffix}`;
};

// @desc    Place new Order (Customer)
// @route   POST /api/orders
// @access  Private (Customer)
exports.createOrder = async (req, res, next) => {
  try {
    const {
      addressId,
      deliveryAddress: customAddress,
      paymentMethod = 'COD',
      items: directItems,
      notes
    } = req.body;

    let itemsToProcess = [];

    // If items passed directly (from checkout cart or "Buy Now"), use those; otherwise fetch from customer's Cart
    if (directItems && Array.isArray(directItems) && directItems.length > 0) {
      itemsToProcess = directItems.map(it => ({
        product: it.product?._id || it.product,
        quantity: it.quantity
      }));
    } else {
      const cart = await Cart.findOne({ customer: req.user._id }).populate('items.product');
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Your cart is empty. Please select cakes and add them to cart.'
        });
      }
      itemsToProcess = cart.items.map(it => ({
        product: it.product?._id || it.product,
        quantity: it.quantity
      }));
    }

    // Determine delivery address
    let deliveryAddress = null;
    if (addressId) {
      const savedAddress = await Address.findOne({
        $or: [
          { _id: addressId, customer: req.user._id },
          { _id: addressId }
        ]
      });
      if (savedAddress) {
        deliveryAddress = {
          name: savedAddress.name,
          phoneNumber: savedAddress.phoneNumber,
          doorNumber: savedAddress.doorNumber,
          street: savedAddress.street,
          village: savedAddress.village || '',
          taluk: savedAddress.taluk || '',
          district: savedAddress.district,
          state: savedAddress.state,
          pincode: savedAddress.pincode
        };
      }
    }

    if (!deliveryAddress && customAddress) {
      deliveryAddress = customAddress;
    }

    // Fallback: check if user has any saved address in database
    if (!deliveryAddress) {
      const defaultAddr = await Address.findOne({ customer: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
      if (defaultAddr) {
        deliveryAddress = {
          name: defaultAddr.name,
          phoneNumber: defaultAddr.phoneNumber,
          doorNumber: defaultAddr.doorNumber,
          street: defaultAddr.street,
          village: defaultAddr.village || '',
          taluk: defaultAddr.taluk || '',
          district: defaultAddr.district,
          state: defaultAddr.state,
          pincode: defaultAddr.pincode
        };
      } else {
        return res.status(400).json({
          success: false,
          message: 'Delivery address is required. Please save a delivery address.'
        });
      }
    }

    // Validate products & calculate subtotal
    const processedItems = [];
    let subtotal = 0;

    for (const item of itemsToProcess) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.product} not found`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      processedItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: item.quantity,
        subtotal: itemTotal
      });
    }

    const deliveryFee = subtotal > 500 ? 0 : 40;
    const totalAmount = subtotal + deliveryFee;
    const orderNumber = generateOrderNumber();

    const initialOrderStatus = paymentMethod === 'COD' ? 'Pending' : 'Pending';
    const initialPaymentStatus = paymentMethod === 'COD' ? 'Pending' : 'Pending';

    // Create order document
    const order = await Order.create({
      orderNumber,
      customer: req.user._id,
      items: processedItems,
      subtotal,
      deliveryFee,
      totalAmount,
      deliveryAddress,
      paymentMethod,
      paymentStatus: initialPaymentStatus,
      orderStatus: initialOrderStatus,
      notes: notes || '',
      statusHistory: [
        {
          status: 'Pending',
          timestamp: new Date(),
          comment: `Order placed via ${paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}`
        }
      ]
    });

    // Deduct stock and record stock movements
    for (const item of processedItems) {
      const product = await Product.findById(item.product);
      if (product) {
        const prev = product.stock;
        product.stock = Math.max(0, product.stock - item.quantity);
        if (product.stock === 0) {
          product.isAvailable = false;
        }
        await product.save();

        await StockMovement.create({
          product: product._id,
          type: 'SALE',
          quantity: item.quantity,
          previousStock: prev,
          newStock: product.stock,
          reason: `Customer Order ${order.orderNumber}`,
          order: order._id
        });
      }
    }

    // If COD, record initial sale
    if (paymentMethod === 'COD') {
      await Sale.create({
        order: order._id,
        orderNumber: order.orderNumber,
        customer: req.user._id,
        customerName: deliveryAddress.name,
        amount: totalAmount,
        paymentMethod: 'COD',
        itemsCount: processedItems.reduce((acc, it) => acc + it.quantity, 0),
        date: new Date()
      });
    }

    // Clear cart if ordered from cart
    if (!directItems) {
      await Cart.findOneAndUpdate({ customer: req.user._id }, { items: [] });
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer's orders
// @route   GET /api/orders/my-orders
// @access  Private (Customer)
exports.getMyOrders = async (req, res, next) => {
  try {
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    const orders = await Order.find({ customer: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Owner)
// @route   GET /api/orders
// @access  Private (Owner)
exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, paymentStatus, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    if (paymentStatus && paymentStatus !== 'all') {
      query.paymentStatus = paymentStatus;
    }

    if (search && search.trim()) {
      query.$or = [
        { orderNumber: { $regex: search.trim(), $options: 'i' } },
        { 'deliveryAddress.name': { $regex: search.trim(), $options: 'i' } },
        { 'deliveryAddress.phoneNumber': { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('customer', 'name phone email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private (Customer or Owner)
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name phone email')
      .populate('payment');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // If customer, ensure it is their order
    if (req.user.role === 'customer' && (order.customer?._id || order.customer)?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Order Status (Owner)
// @route   PUT /api/orders/:id/status
// @access  Private (Owner)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, comment, paymentStatus } = req.body;

    const validStatuses = [
      'Pending',
      'Confirmed',
      'Preparing',
      'Ready',
      'Out for Delivery',
      'Delivered',
      'Cancelled'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status. Allowed: ${validStatuses.join(', ')}`
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const previousStatus = order.orderStatus;
    order.orderStatus = status;

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    } else if (status === 'Delivered' && order.paymentMethod === 'COD') {
      order.paymentStatus = 'Completed';
    }

    order.statusHistory.push({
      status,
      timestamp: new Date(),
      comment: comment || `Status updated from ${previousStatus} to ${status}`
    });

    // If order was cancelled, restore inventory
    if (status === 'Cancelled' && previousStatus !== 'Cancelled') {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          const prev = product.stock;
          product.stock += item.quantity;
          product.isAvailable = true;
          await product.save();

          await StockMovement.create({
            product: product._id,
            type: 'RETURN',
            quantity: item.quantity,
            previousStock: prev,
            newStock: product.stock,
            reason: `Order ${order.orderNumber} Cancelled - Restocked`,
            order: order._id,
            performedBy: req.user._id
          });
        }
      }
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel Order (Customer or Owner)
// @route   PUT /api/orders/:id/cancel
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify permission
    if (req.user.role === 'customer' && (order.customer?._id || order.customer)?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (['Delivered', 'Cancelled'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order that is already ${order.orderStatus}`
      });
    }

    order.orderStatus = 'Cancelled';
    order.statusHistory.push({
      status: 'Cancelled',
      timestamp: new Date(),
      comment: req.body.reason || `Cancelled by ${req.user.role}`
    });

    // Restore stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        const prev = product.stock;
        product.stock += item.quantity;
        product.isAvailable = true;
        await product.save();

        await StockMovement.create({
          product: product._id,
          type: 'RETURN',
          quantity: item.quantity,
          previousStock: prev,
          newStock: product.stock,
          reason: `Order ${order.orderNumber} Cancelled`,
          order: order._id
        });
      }
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    next(error);
  }
};

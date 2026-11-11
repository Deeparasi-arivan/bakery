const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Helper to calculate totals
const formatCartResponse = (cart) => {
  let subtotal = 0;
  let totalItems = 0;

  const items = cart.items.map(item => {
    const itemSubtotal = (item.unitPrice || 0) * item.quantity;
    subtotal += itemSubtotal;
    totalItems += item.quantity;
    return {
      _id: item._id,
      product: item.product,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: itemSubtotal
    };
  });

  const deliveryFee = subtotal > 500 || subtotal === 0 ? 0 : 40;
  const totalAmount = subtotal + deliveryFee;

  return {
    _id: cart._id,
    customer: cart.customer,
    items,
    totalItems,
    subtotal,
    deliveryFee,
    totalAmount
  };
};

// @desc    Get customer cart
// @route   GET /api/cart
// @access  Private (Customer)
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ customer: req.user._id }).populate({
      path: 'items.product',
      select: 'name price image stock isAvailable quantity category'
    });

    if (!cart) {
      cart = await Cart.create({ customer: req.user._id, items: [] });
    }

    res.status(200).json({
      success: true,
      cart: formatCartResponse(cart)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add product to cart
// @route   POST /api/cart/add
// @access  Private (Customer)
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (!product.isAvailable || product.stock < 1) {
      return res.status(400).json({ success: false, message: 'This item is currently out of stock' });
    }

    let cart = await Cart.findOne({ customer: req.user._id });
    if (!cart) {
      cart = await Cart.create({ customer: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    const qtyToAdd = Math.max(1, Number(quantity));

    if (itemIndex > -1) {
      const currentQty = cart.items[itemIndex].quantity;
      const targetQty = currentQty + qtyToAdd;

      if (targetQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} items available in stock. You already have ${currentQty} in your cart.`
        });
      }

      cart.items[itemIndex].quantity = targetQty;
      cart.items[itemIndex].unitPrice = product.price;
    } else {
      if (qtyToAdd > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} items available in stock.`
        });
      }

      cart.items.push({
        product: product._id,
        quantity: qtyToAdd,
        unitPrice: product.price
      });
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name price image stock isAvailable quantity category'
    });

    res.status(200).json({
      success: true,
      message: `${product.name} added to cart`,
      cart: formatCartResponse(populatedCart)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update quantity of product in cart (Increase / Decrease)
// @route   PUT /api/cart/update
// @access  Private (Customer)
exports.updateQuantity = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const qty = Number(quantity);

    let cart = await Cart.findOne({ customer: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not in cart' });
    }

    if (qty <= 0) {
      // Remove item if quantity is zero or less
      cart.items.splice(itemIndex, 1);
    } else {
      const product = await Product.findById(productId);
      if (product && qty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot exceed available stock of ${product.stock}`
        });
      }
      cart.items[itemIndex].quantity = qty;
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name price image stock isAvailable quantity category'
    });

    res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart: formatCartResponse(populatedCart)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove product from cart
// @route   DELETE /api/cart/item/:productId
// @access  Private (Customer)
exports.removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    let cart = await Cart.findOne({ customer: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name price image stock isAvailable quantity category'
    });

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      cart: formatCartResponse(populatedCart)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart/clear
// @access  Private (Customer)
exports.clearCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ customer: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      cart: { items: [], totalItems: 0, subtotal: 0, deliveryFee: 0, totalAmount: 0 }
    });
  } catch (error) {
    next(error);
  }
};

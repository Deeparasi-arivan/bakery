const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');

// @desc    Get all products (with search, category filter, pagination)
// @route   GET /api/products
exports.getProducts = async (req, res, next) => {
  try {
    const { category, search, minPrice, maxPrice, isAvailable, sort, limit = 50, page = 1 } = req.query;

    const query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (isAvailable !== undefined) {
      query.isAvailable = isAvailable === 'true';
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price-low') sortOption = { price: 1 };
    if (sort === 'price-high') sortOption = { price: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };
    if (sort === 'name') sortOption = { name: 1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add product
// @route   POST /api/products
// @access  Private (Owner)
exports.createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      price,
      quantity,
      stock,
      lowStockThreshold,
      isAvailable,
      image: imageBody
    } = req.body;

    if (!name || !category || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, Category, and Price are required'
      });
    }

    let image = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80';
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    } else if (imageBody) {
      image = imageBody;
    }

    const initialStock = Number(stock) || 0;

    const product = await Product.create({
      name,
      description,
      category,
      price: Number(price),
      quantity: quantity || '500g',
      stock: initialStock,
      lowStockThreshold: Number(lowStockThreshold) || 5,
      isAvailable: isAvailable !== undefined ? isAvailable === 'true' || isAvailable === true : true,
      image
    });

    // Record initial stock movement
    if (initialStock > 0) {
      await StockMovement.create({
        product: product._id,
        type: 'IN',
        quantity: initialStock,
        previousStock: 0,
        newStock: initialStock,
        reason: 'Initial Product Stock Addition',
        performedBy: req.user ? req.user._id : undefined
      });
    }

    const populated = await Product.findById(product._id).populate('category', 'name slug');

    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      product: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Owner)
exports.updateProduct = async (req, res, next) => {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updateData = { ...req.body };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    if (updateData.price !== undefined) updateData.price = Number(updateData.price);
    if (updateData.lowStockThreshold !== undefined) updateData.lowStockThreshold = Number(updateData.lowStockThreshold);
    if (updateData.isAvailable !== undefined) {
      updateData.isAvailable = updateData.isAvailable === 'true' || updateData.isAvailable === true;
    }

    // Check if stock changed manually via edit form
    if (updateData.stock !== undefined && Number(updateData.stock) !== existing.stock) {
      const newStock = Number(updateData.stock);
      const diff = newStock - existing.stock;

      await StockMovement.create({
        product: existing._id,
        type: diff > 0 ? 'IN' : 'ADJUSTMENT',
        quantity: Math.abs(diff),
        previousStock: existing.stock,
        newStock: newStock,
        reason: 'Product Edit - Manual Stock Adjustment',
        performedBy: req.user ? req.user._id : undefined
      });

      updateData.stock = newStock;
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).populate('category', 'name slug');

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Owner)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `Product '${product.name}' deleted successfully`
    });
  } catch (error) {
    next(error);
  }
};

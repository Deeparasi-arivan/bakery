const Address = require('../models/Address');
const Customer = require('../models/Customer');

// @desc    Get all addresses of customer
// @route   GET /api/addresses
// @access  Private (Customer)
exports.getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ customer: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    res.status(200).json({
      success: true,
      count: addresses.length,
      addresses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new address
// @route   POST /api/addresses
// @access  Private (Customer or Owner)
exports.createAddress = async (req, res, next) => {
  try {
    const {
      name,
      phoneNumber,
      doorNumber,
      street,
      village,
      taluk,
      district,
      pincode,
      state,
      isDefault
    } = req.body;

    if (!name || !phoneNumber || !doorNumber || !street) {
      return res.status(400).json({
        success: false,
        message: 'Please provide recipient name, phone number, door/flat number, and street'
      });
    }

    const cleanDistrict = district || 'Bangalore Urban';
    const cleanState = state || 'Karnataka';
    const cleanPincode = pincode || '560001';

    // Check if this is the first address
    const existingCount = await Address.countDocuments({ customer: req.user._id });
    const shouldBeDefault = isDefault !== undefined ? Boolean(isDefault) : existingCount === 0;

    if (shouldBeDefault) {
      await Address.updateMany({ customer: req.user._id }, { isDefault: false });
    }

    const address = await Address.create({
      customer: req.user._id,
      name: String(name).trim(),
      phoneNumber: String(phoneNumber).trim(),
      doorNumber: String(doorNumber).trim(),
      street: String(street).trim(),
      village: (village || '').trim(),
      taluk: (taluk || '').trim(),
      district: String(cleanDistrict).trim(),
      pincode: String(cleanPincode).trim(),
      state: String(cleanState).trim(),
      isDefault: shouldBeDefault
    });

    if (shouldBeDefault && req.user.role === 'customer') {
      await Customer.findByIdAndUpdate(req.user._id, { defaultAddress: address._id });
    }

    res.status(201).json({
      success: true,
      message: 'Address saved successfully',
      address
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update address
// @route   PUT /api/addresses/:id
// @access  Private (Customer)
exports.updateAddress = async (req, res, next) => {
  try {
    let address = await Address.findOne({ _id: req.params.id, customer: req.user._id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    if (req.body.isDefault) {
      await Address.updateMany({ customer: req.user._id }, { isDefault: false });
      if (req.user.role === 'customer') {
        await Customer.findByIdAndUpdate(req.user._id, { defaultAddress: address._id });
      }
    }

    address = await Address.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      address
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete address
// @route   DELETE /api/addresses/:id
// @access  Private (Customer)
exports.deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, customer: req.user._id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    // If was default, make another address default
    if (address.isDefault) {
      const remaining = await Address.findOne({ customer: req.user._id });
      if (remaining) {
        remaining.isDefault = true;
        await remaining.save();
        if (req.user.role === 'customer') {
          await Customer.findByIdAndUpdate(req.user._id, { defaultAddress: remaining._id });
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Set default delivery address
// @route   PUT /api/addresses/:id/default
// @access  Private (Customer)
exports.setDefaultAddress = async (req, res, next) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, customer: req.user._id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    await Address.updateMany({ customer: req.user._id }, { isDefault: false });
    address.isDefault = true;
    await address.save();

    if (req.user.role === 'customer') {
      await Customer.findByIdAndUpdate(req.user._id, { defaultAddress: address._id });
    }

    res.status(200).json({
      success: true,
      message: 'Delivery address selected as default',
      address
    });
  } catch (error) {
    next(error);
  }
};

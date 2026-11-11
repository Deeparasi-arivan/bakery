const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const customerSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: [true, 'Mobile number is required'],
      unique: true,
      trim: true
    },
    name: {
      type: String,
      default: 'Valued Customer',
      trim: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters']
    },
    role: {
      type: String,
      default: 'customer'
    },
    otp: {
      type: String
    },
    otpExpires: {
      type: Date
    },
    isVerified: {
      type: Boolean,
      default: true
    },
    defaultAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Address'
    }
  },
  {
    timestamps: true
  }
);

customerSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

customerSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Customer', customerSchema);

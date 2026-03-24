const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  image: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  discountPrice: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, trim: true },
  isSafe: { type: Boolean, default: true },
  description: { type: String, default: '', trim: true },
  manufacturer: { type: String, default: '', trim: true },
  stock: { type: Number, default: 0, min: 0 },
  prescriptionRequired: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);

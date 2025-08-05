const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  image: String,
  price: Number,
  discountPrice: Number,
  category: String,
  isSafe: Boolean
});

module.exports = mongoose.model('Product', productSchema);

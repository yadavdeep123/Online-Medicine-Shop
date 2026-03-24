const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/product');

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/600x400?text=Medicine';

function buildMedicineImageUrl(name) {
  const normalized = String(name || 'medicine').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `https://picsum.photos/seed/med-${normalized || 'medicine'}/700/500`;
}

function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}

function normalizeProductInput(body = {}) {
  const price = Number(body.price);
  const discountPrice = Number(body.discountPrice);
  const stock = Number(body.stock);
  const name = String(body.name || '').trim();
  const rawImage = String(body.image || '').trim();
  const image = rawImage || buildMedicineImageUrl(name) || PLACEHOLDER_IMAGE;

  return {
    name,
    category: String(body.category || '').trim(),
    image,
    price: Number.isFinite(price) ? price : NaN,
    discountPrice: Number.isFinite(discountPrice) ? discountPrice : NaN,
    isSafe: Boolean(body.isSafe),
    description: String(body.description || '').trim(),
    manufacturer: String(body.manufacturer || '').trim(),
    stock: Number.isFinite(stock) ? stock : 0,
    prescriptionRequired: Boolean(body.prescriptionRequired)
  };
}

function validateProductInput(payload) {
  if (!payload.name || !payload.category) {
    return 'Name and category are required';
  }
  if (!Number.isFinite(payload.price) || payload.price < 0) {
    return 'Price must be a valid non-negative number';
  }
  if (!Number.isFinite(payload.discountPrice) || payload.discountPrice < 0) {
    return 'Discount price must be a valid non-negative number';
  }
  if (!Number.isFinite(payload.stock) || payload.stock < 0) {
    return 'Stock must be a valid non-negative number';
  }
  return null;
}

// GET all products
router.get('/', async (req, res) => {
  if (!isDatabaseConnected()) {
    return res.status(503).json({ message: 'Database is not connected yet' });
  }

  try {
    const products = await Product.find().sort({ _id: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
});

// POST new product
router.post('/', async (req, res) => {
  if (!isDatabaseConnected()) {
    return res.status(503).json({ message: 'Database is not connected yet' });
  }

  try {
    const payload = normalizeProductInput(req.body);
    const validationError = validateProductInput(payload);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const product = new Product(payload);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create product', error: error.message });
  }
});

module.exports = router;

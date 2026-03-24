const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');
require('dotenv').config();

const productRoutes = require('./routes/productroutes');
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const Product = require('./models/product');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
let dbMode = 'disconnected';
let memoryServer;

function buildMedicineImageUrl(name, index = 1, category = '') {
  const c = String(category || '').toLowerCase();

  const categoryPools = {
    'pain relief': [
      'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=700&q=80'
    ],
    diabetes: [
      'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=700&q=80'
    ],
    'skin care': [
      'https://images.unsplash.com/photo-1556228724-4b6c79c1c8f6?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=700&q=80'
    ],
    respiratory: [
      'https://images.unsplash.com/photo-1628771065518-0d82f1938462?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=700&q=80'
    ],
    vitamins: [
      'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1584362917165-526a968579e8?auto=format&fit=crop&w=700&q=80'
    ],
    default: [
      'https://images.unsplash.com/photo-1584362917165-526a968579e8?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=700&q=80'
    ]
  };

  let pool = categoryPools.default;
  if (c.includes('pain')) pool = categoryPools['pain relief'];
  else if (c.includes('diabetes')) pool = categoryPools.diabetes;
  else if (c.includes('skin')) pool = categoryPools['skin care'];
  else if (c.includes('respiratory') || c.includes('cold') || c.includes('allergy')) pool = categoryPools.respiratory;
  else if (c.includes('vitamin') || c.includes('immunity')) pool = categoryPools.vitamins;

  const nameScore = String(name || '')
    .split('')
    .reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return pool[(nameScore + index) % pool.length];
}

// Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Backend is running', dbMode });
});

app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

function generateSeedProducts() {
  const manufacturers = ['Sun Pharma', 'Cipla', 'Dr. Reddy Labs', 'Mankind', 'Lupin', 'Abbott', 'Zydus', 'Alkem'];
  const baseMedicines = [
    { name: 'Paracetamol 650 Tablet', category: 'Pain Relief' },
    { name: 'Dolo 650 Tablet', category: 'Pain Relief' },
    { name: 'Calpol 500 Tablet', category: 'Pain Relief' },
    { name: 'Ibuprofen 400 Tablet', category: 'Pain Relief' },
    { name: 'Combiflam Tablet', category: 'Pain Relief' },
    { name: 'Aspirin 75 Tablet', category: 'Cardiac Care' },
    { name: 'Disprin Tablet', category: 'Pain Relief' },
    { name: 'Cetirizine 10 Tablet', category: 'Allergy' },
    { name: 'Levocetirizine 5 Tablet', category: 'Allergy' },
    { name: 'Montelukast 10 Tablet', category: 'Respiratory' },
    { name: 'Azithromycin 500 Tablet', category: 'Antibiotic' },
    { name: 'Amoxicillin 500 Capsule', category: 'Antibiotic' },
    { name: 'Cefixime 200 Tablet', category: 'Antibiotic' },
    { name: 'Ofloxacin 200 Tablet', category: 'Antibiotic' },
    { name: 'Doxycycline 100 Capsule', category: 'Antibiotic' },
    { name: 'Metformin 500 Tablet', category: 'Diabetes' },
    { name: 'Glimepiride 1 Tablet', category: 'Diabetes' },
    { name: 'Teneligliptin 20 Tablet', category: 'Diabetes' },
    { name: 'Insulin Glargine Injection', category: 'Diabetes' },
    { name: 'Atorvastatin 10 Tablet', category: 'Cardiac Care' },
    { name: 'Rosuvastatin 10 Tablet', category: 'Cardiac Care' },
    { name: 'Amlodipine 5 Tablet', category: 'Blood Pressure' },
    { name: 'Telmisartan 40 Tablet', category: 'Blood Pressure' },
    { name: 'Losartan 50 Tablet', category: 'Blood Pressure' },
    { name: 'Clopidogrel 75 Tablet', category: 'Cardiac Care' },
    { name: 'Pantoprazole 40 Tablet', category: 'Digestive Care' },
    { name: 'Omeprazole 20 Capsule', category: 'Digestive Care' },
    { name: 'Rabeprazole 20 Tablet', category: 'Digestive Care' },
    { name: 'Domperidone 10 Tablet', category: 'Digestive Care' },
    { name: 'Ondansetron 4 Tablet', category: 'Digestive Care' },
    { name: 'ORS Powder', category: 'Hydration' },
    { name: 'Electral ORS Sachet', category: 'Hydration' },
    { name: 'Zincovit Tablet', category: 'Vitamins' },
    { name: 'Becosules Capsule', category: 'Vitamins' },
    { name: 'Shelcal 500 Tablet', category: 'Vitamins' },
    { name: 'Neurobion Forte Tablet', category: 'Vitamins' },
    { name: 'Vitamin D3 60000 IU Capsule', category: 'Vitamins' },
    { name: 'Iron Folic Acid Tablet', category: 'Vitamins' },
    { name: 'Digene Gel', category: 'Digestive Care' },
    { name: 'Gelusil Syrup', category: 'Digestive Care' },
    { name: 'Benadryl Cough Syrup', category: 'Respiratory' },
    { name: 'Ascoril LS Syrup', category: 'Respiratory' },
    { name: 'Sinarest Tablet', category: 'Cold & Flu' },
    { name: 'Volini Spray', category: 'Pain Relief' },
    { name: 'Iodex Balm', category: 'Pain Relief' },
    { name: 'Mupirocin Ointment', category: 'Skin Care' },
    { name: 'Clotrimazole Cream', category: 'Skin Care' },
    { name: 'Ketoconazole Shampoo', category: 'Skin Care' },
    { name: 'Betadine Gargle', category: 'First Aid' },
    { name: 'Nasal Decongestant Spray', category: 'Respiratory' }
  ];

  return baseMedicines.map((item, idx) => {
    const i = idx + 1;
    const mrp = 60 + ((i * 29) % 640);
    const discount = Math.max(35, mrp - (12 + (i % 6) * 7));
    return {
      name: item.name,
      image: buildMedicineImageUrl(item.name, i, item.category),
      price: mrp,
      discountPrice: discount,
      category: item.category,
      isSafe: i % 9 !== 0,
      description: `Commonly used ${item.category.toLowerCase()} medicine available in market.`,
      manufacturer: manufacturers[idx % manufacturers.length],
      stock: 25 + (i % 70),
      prescriptionRequired: i % 4 === 0
    };
  });
}

async function ensureSeedProducts() {
  const currentCount = await Product.countDocuments();
  const sample = await Product.findOne({}, { name: 1 }).lean();
  const hasOldGenericData = !!(sample && typeof sample.name === 'string' && sample.name.startsWith('Medicine '));

  if (currentCount === 50 && !hasOldGenericData) {
    return;
  }

  if (currentCount > 0) {
    await Product.deleteMany({});
  }

  const seedProducts = generateSeedProducts();
  await Product.insertMany(seedProducts);
  console.log('Seeded 50 market medicine products with images');
}

async function ensureAllProductsHaveImages() {
  const products = await Product.find({}, { _id: 1, name: 1, image: 1, category: 1 }).lean();
  const updates = [];

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const hasValidUrl = typeof product.image === 'string' && /^https?:\/\//i.test(product.image.trim());
    const hasRandomSeedImage = hasValidUrl && /picsum\.photos\/(seed|id)\//i.test(product.image);
    const hasPlaceholderImage = hasValidUrl && /placeholder\.com|placehold\.co/i.test(product.image);

    if (!hasValidUrl || hasRandomSeedImage || hasPlaceholderImage) {
      updates.push({
        updateOne: {
          filter: { _id: product._id },
          update: { $set: { image: buildMedicineImageUrl(product.name, i + 1, product.category || '') } }
        }
      });
    }
  }

  if (updates.length) {
    await Product.bulkWrite(updates);
    console.log(`Backfilled images for ${updates.length} medicines`);
  }
}

async function startServer() {
  try {
    if (MONGO_URI) {
      try {
        await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
        dbMode = 'external';
        console.log('MongoDB connected (external)');
      } catch (dbErr) {
        console.error('External MongoDB connection failed:', dbErr.message);
        console.log('Starting in-memory MongoDB fallback...');
        memoryServer = await MongoMemoryServer.create();
        const memoryUri = memoryServer.getUri();
        await mongoose.connect(memoryUri);
        dbMode = 'memory';
        console.log('MongoDB connected (in-memory fallback)');
      }
    } else {
      console.log('MONGO_URI not found. Starting in-memory MongoDB...');
      memoryServer = await MongoMemoryServer.create();
      const memoryUri = memoryServer.getUri();
      await mongoose.connect(memoryUri);
      dbMode = 'memory';
      console.log('MongoDB connected (in-memory)');
    }

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

    await ensureSeedProducts();
    await ensureAllProductsHaveImages();
  } catch (err) {
    console.error('Failed to start server:', err.message);
  }
}

startServer();

process.on('SIGINT', async () => {
  if (memoryServer) {
    await memoryServer.stop();
  }
  process.exit(0);
});

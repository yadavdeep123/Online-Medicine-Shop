const API_BASE = window.location.origin;

// State Management
let currentUser = null;
let currentCart = null;
let products = [];
let doctors = [];
let labTests = [];
let filteredDoctors = [];
let filteredTests = [];
const IMAGE_FALLBACK = 'https://via.placeholder.com/600x400?text=Medicine';

function generateDoctors(count = 24) {
  const firstNames = ['Aarav', 'Vihaan', 'Rajesh', 'Priya', 'Ananya', 'Meera', 'Neha', 'Amit', 'Vikram', 'Suresh', 'Karan', 'Ritika'];
  const lastNames = ['Sharma', 'Patel', 'Singh', 'Verma', 'Gupta', 'Rao', 'Iyer', 'Nair', 'Khan', 'Jain'];
  const specializations = ['Cardiology', 'Dermatology', 'Orthopedics', 'Pediatrics', 'Neurology', 'Gynecology', 'General Medicine', 'Ophthalmology', 'ENT', 'Psychiatry'];
  const cities = ['Delhi', 'Mumbai', 'Bangalore', 'Pune', 'Hyderabad', 'Kolkata', 'Chennai', 'Ahmedabad', 'Jaipur', 'Lucknow'];

  return Array.from({ length: count }, (_, idx) => {
    const i = idx + 1;
    const first = firstNames[idx % firstNames.length];
    const last = lastNames[(idx * 3) % lastNames.length];
    return {
      id: i,
      name: `Dr. ${first} ${last}`,
      specialization: specializations[idx % specializations.length],
      location: cities[idx % cities.length],
      available: i % 5 !== 0,
      image: `https://i.pravatar.cc/150?img=${(idx % 70) + 1}`,
      experience: `${5 + (idx % 16)} years`,
      rating: (4.2 + ((idx % 7) * 0.1)).toFixed(1)
    };
  });
}

function generateLabTests() {
  const tests = [
    ['Complete Blood Count (CBC)', 'Blood Tests', 299, '24 hours', 'Full blood count and infection markers'],
    ['Thyroid Profile (T3, T4, TSH)', 'Hormone Tests', 499, '24 hours', 'Thyroid function assessment'],
    ['Lipid Profile', 'Blood Tests', 399, '24 hours', 'Cholesterol and triglycerides'],
    ['Liver Function Test (LFT)', 'Biochemistry', 349, '24 hours', 'Comprehensive liver health check'],
    ['Kidney Function Test (KFT)', 'Biochemistry', 349, '24 hours', 'Creatinine and urea check'],
    ['Diabetes Screening', 'Metabolic Tests', 199, '12 hours', 'Fasting glucose screening'],
    ['Vitamin D Test', 'Micronutrient', 449, '24 hours', 'Vitamin D deficiency screening'],
    ['Vitamin B12 Test', 'Micronutrient', 499, '24 hours', 'B12 deficiency screening'],
    ['HbA1c Test', 'Diabetes', 399, '24 hours', 'Average sugar of last 3 months'],
    ['CRP Test', 'Inflammation', 350, '12 hours', 'Inflammation marker test'],
    ['Dengue NS1 Antigen', 'Viral Tests', 650, '24 hours', 'Early dengue detection'],
    ['Malaria Parasite Test', 'Viral Tests', 400, '12 hours', 'Malaria parasite detection'],
    ['Typhoid IgM Test', 'Viral Tests', 550, '24 hours', 'Typhoid infection screening'],
    ['Urine Routine', 'Urine Tests', 180, '12 hours', 'General urine analysis'],
    ['Urine Culture', 'Urine Tests', 450, '48 hours', 'Urine bacteria culture'],
    ['Iron Profile', 'Micronutrient', 525, '24 hours', 'Iron and ferritin levels'],
    ['Calcium Test', 'Micronutrient', 220, '12 hours', 'Serum calcium level'],
    ['Electrolyte Panel', 'Biochemistry', 380, '12 hours', 'Sodium potassium chloride levels'],
    ['Uric Acid Test', 'Biochemistry', 210, '12 hours', 'Gout risk marker'],
    ['ESR Test', 'Inflammation', 140, '12 hours', 'Erythrocyte sedimentation rate'],
    ['Prolactin Test', 'Hormone Tests', 520, '24 hours', 'Prolactin hormone level'],
    ['Testosterone Test', 'Hormone Tests', 750, '24 hours', 'Male hormone profile'],
    ['AMH Test', 'Hormone Tests', 1400, '48 hours', 'Ovarian reserve marker'],
    ['Pregnancy Beta-HCG', 'Hormone Tests', 430, '12 hours', 'Pregnancy detection test'],
    ['COVID-19 RT-PCR', 'Viral Tests', 599, '24 hours', 'RT-PCR covid test'],
    ['Allergy Profile', 'Immunology', 1299, '48 hours', 'Common allergen screening'],
    ['ANA Test', 'Immunology', 990, '48 hours', 'Autoimmune disease marker'],
    ['PSA Test', 'Cancer Marker', 850, '24 hours', 'Prostate-specific antigen'],
    ['CA-125 Test', 'Cancer Marker', 1100, '48 hours', 'Ovarian cancer marker'],
    ['Troponin-I Test', 'Cardiac Marker', 900, '12 hours', 'Heart injury marker']
  ];

  return tests.map((test, idx) => ({
    id: idx + 1,
    name: test[0],
    category: test[1],
    price: test[2],
    time: test[3],
    description: test[4],
    image: 'https://onemg.gumlet.io/a_ignore,w_380,h_380,c_fit/xyvclpzrsphlp9tvrtxj.jpg'
  }));
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadUser();
  loadProducts();
  loadDoctors();
  loadLabTests();
  updateUI();
});

// User Management
function loadUser() {
  const token = localStorage.getItem('authToken');
  if (token) {
    fetch(`${API_BASE}/api/auth/profile/${token}`)
      .then(res => res.json())
      .then(user => {
        currentUser = user;
        loadCart();
        updateUI();
      })
      .catch(() => logout());
  }
}

function login() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    alert('Email and password are required');
    return;
  }

  fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        currentUser = data.user;
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
        loadCart();
        showHome();
        updateUI();
      } else {
        alert(data.message || 'Login failed');
      }
    })
    .catch(err => alert('Login error: ' + err.message));
}

function register() {
  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const phone = document.getElementById('registerPhone').value;
  const address = document.getElementById('registerAddress').value;

  if (!name || !email || !password) {
    alert('Name, email, and password are required');
    return;
  }

  fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, phone, address })
  })
    .then(res => res.json())
    .then(data => {
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        currentUser = data.user;
        document.getElementById('registerName').value = '';
        document.getElementById('registerEmail').value = '';
        document.getElementById('registerPassword').value = '';
        document.getElementById('registerPhone').value = '';
        document.getElementById('registerAddress').value = '';
        loadCart();
        showHome();
        updateUI();
      } else {
        alert(data.message || 'Registration failed');
      }
    })
    .catch(err => alert('Registration error: ' + err.message));
}

function logout() {
  localStorage.removeItem('authToken');
  currentUser = null;
  currentCart = null;
  showHome();
  updateUI();
}

// cart Management
function loadCart() {
  if (!currentUser) return;

  fetch(`${API_BASE}/api/cart/${currentUser.id}`)
    .then(res => res.json())
    .then(cart => {
      currentCart = cart;
      updateCartUI();
    });
}

function addToCart(productId) {
  if (!currentUser) {
    alert('Please login to add items to cart');
    showAuth();
    return;
  }

  const product = products.find(p => p._id === productId);
  if (!product) return;

  fetch(`${API_BASE}/api/cart/${currentUser.id}/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, quantity: 1 })
  })
    .then(res => res.json())
    .then(cart => {
      currentCart = cart;
      updateCartUI();
      alert('Added to cart!');
    })
    .catch(err => alert('Error adding to cart: ' + err.message));
}

function removeFromCart(productId) {
  if (!currentUser) return;

  fetch(`${API_BASE}/api/cart/${currentUser.id}/remove`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId })
  })
    .then(res => res.json())
    .then(cart => {
      currentCart = cart;
      updateCartUI();
    });
}

function clearCart() {
  if (!currentUser) return;

  fetch(`${API_BASE}/api/cart/${currentUser.id}/clear`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  })
    .then(res => res.json())
    .then(cart => {
      currentCart = cart;
      updateCartUI();
    });
}

// Products
function loadProducts() {
  fetch(`${API_BASE}/api/products`)
    .then(res => res.json())
    .then(data => {
      products = data;
      renderProducts();
    });
}

function renderProducts() {
  const grid = document.getElementById('productsGrid');
  const empty = document.getElementById('emptyProducts');

  if (!products.length) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  const sectionBuckets = {
    pain: [],
    diabetes: [],
    skin: [],
    respiratory: [],
    vitamins: [],
    others: []
  };

  const normalize = (value) => String(value || '').toLowerCase();
  const getBucket = (category) => {
    const c = normalize(category);
    if (c.includes('pain')) return 'pain';
    if (c.includes('diabetes')) return 'diabetes';
    if (c.includes('skin')) return 'skin';
    if (c.includes('respiratory') || c.includes('cold') || c.includes('allergy')) return 'respiratory';
    if (c.includes('vitamin') || c.includes('immunity')) return 'vitamins';
    return 'others';
  };

  products.forEach((product) => {
    sectionBuckets[getBucket(product.category)].push(product);
  });

  const sections = [
    { key: 'pain', title: 'Pain Relief' },
    { key: 'diabetes', title: 'Diabetes Care' },
    { key: 'skin', title: 'Skin Care' },
    { key: 'respiratory', title: 'Respiratory & Cold' },
    { key: 'vitamins', title: 'Vitamins & Immunity' },
    { key: 'others', title: 'Other Medicines' }
  ];

  const renderCard = (product) => `
    <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
      <div class="card product-card">
        <img src="${product.image || IMAGE_FALLBACK}" onerror="this.onerror=null;this.src='${IMAGE_FALLBACK}'" class="card-img-top" alt="${product.name}">
        <div class="card-body d-flex flex-column gap-2">
          <h5 class="card-title mb-0">${product.name}</h5>
          <p class="text-muted small mb-0">${product.category}</p>
          <span class="badge-safe">${product.isSafe ? '✓ Safety Assured' : 'Check Label'}</span>
          <div class="price-section mt-auto">
            <span class="price-original">₹${product.price}</span>
            <span class="price-discount">₹${product.discountPrice}</span>
          </div>
          <button class="btn-add-cart" onclick="addToCart('${product._id}')">
            <i class="fas fa-shopping-cart"></i> Add to Cart
          </button>
        </div>
      </div>
    </div>
  `;

  grid.innerHTML = sections
    .filter((section) => sectionBuckets[section.key].length > 0)
    .map((section) => `
      <div class="col-12 mt-2">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <h4 class="m-0">${section.title}</h4>
          <span class="badge bg-light text-dark border">${sectionBuckets[section.key].length} items</span>
        </div>
      </div>
      ${sectionBuckets[section.key].map(renderCard).join('')}
    `)
    .join('');
}

// Orders
function loadOrders() {
  if (!currentUser) return;

  fetch(`${API_BASE}/api/orders/${currentUser.id}`)
    .then(res => res.json())
    .then(orders => {
      const ordersList = document.getElementById('ordersList');
      const noOrders = document.getElementById('noOrders');

      if (!orders.length) {
        ordersList.innerHTML = '';
        noOrders.style.display = 'block';
        return;
      }

      noOrders.style.display = 'none';
      ordersList.innerHTML = orders.map(order => `
        <div class="card mb-2">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <p class="mb-1"><strong>Order #${order._id.substring(0, 8)}</strong></p>
                <p class="text-muted small mb-0">${new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <span class="badge-status badge-${order.status}">${order.status}</span>
            </div>
            <p class="mb-0 mt-2"><strong>₹${order.totalPrice}</strong></p>
          </div>
        </div>
      `).join('');
    });
}

function placeOrder() {
  if (!currentUser || !currentCart || !currentCart.items.length) {
    alert('Cart is empty');
    return;
  }

  const address = document.getElementById('checkoutAddress').value;
  const phone = document.getElementById('checkoutPhone').value;

  if (!address || !phone) {
    alert('Address and phone are required');
    return;
  }

  fetch(`${API_BASE}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: currentUser.id, address, phone })
  })
    .then(res => res.json())
    .then(order => {
      alert('Order placed successfully! Order ID: ' + order._id.substring(0, 8));
      clearCart();
      document.getElementById('checkoutAddress').value = '';
      document.getElementById('checkoutPhone').value = '';
      loadOrders();
      showHome();
    })
    .catch(err => alert('Error placing order: ' + err.message));
}

// UI Updates
function updateUI() {
  const authNav = document.getElementById('authNav');
  const profileNav = document.getElementById('profileNav');
  const logoutNav = document.getElementById('logoutNav');
  const userNameNav = document.getElementById('userNameNav');

  if (currentUser) {
    authNav.style.display = 'none';
    profileNav.style.display = 'block';
    logoutNav.style.display = 'block';
    userNameNav.textContent = currentUser.name.split(' ')[0];
  } else {
    authNav.style.display = 'block';
    profileNav.style.display = 'none';
    logoutNav.style.display = 'none';
  }
}

function updateCartUI() {
  const cartCount = document.getElementById('cartCount');
  const cartItems = document.getElementById('cartItems');
  const emptyCart = document.getElementById('emptyCart');
  const cartFooter = document.getElementById('cartFooter');

  if (!currentCart || !currentCart.items.length) {
    cartCount.textContent = '0';
    cartItems.innerHTML = '';
    emptyCart.style.display = 'block';
    cartFooter.style.display = 'none';
    return;
  }

  emptyCart.style.display = 'none';
  cartFooter.style.display = 'block';
  cartCount.textContent = currentCart.items.length;

  cartItems.innerHTML = currentCart.items.map(item => `
    <div class="cart-item">
      <img src="${item.image || IMAGE_FALLBACK}" onerror="this.onerror=null;this.src='${IMAGE_FALLBACK}'" class="cart-item-img" alt="${item.name}">
      <div style="flex: 1;">
        <h6 class="mb-1">${item.name}</h6>
        <p class="mb-1 text-muted small">Qty: ${item.quantity}</p>
        <p class="mb-0 fw-bold">₹${item.price * item.quantity}</p>
      </div>
      <span class="cart-item-remove" onclick="removeFromCart('${item.productId}')">✕</span>
    </div>
  `).join('');

  document.getElementById('cartSubtotal').textContent = currentCart.totalPrice;
  document.getElementById('cartTotal').textContent = currentCart.totalPrice;

  document.getElementById('checkoutSummary').innerHTML = currentCart.items.map(item => `
    <p class="mb-1">${item.name} × ${item.quantity} = ₹${item.price * item.quantity}</p>
  `).join('');
  document.getElementById('checkoutTotal').textContent = currentCart.totalPrice;
}

// Page Navigation
function hidAllPages() {
  document.getElementById('homePage').style.display = 'none';
  document.getElementById('authPage').style.display = 'none';
  document.getElementById('profilePage').style.display = 'none';
  document.getElementById('checkoutPage').style.display = 'none';
  document.getElementById('doctorsPage').style.display = 'none';
  document.getElementById('labTestsPage').style.display = 'none';
}

function showHome() {
  hidAllPages();
  document.getElementById('homePage').style.display = 'block';
  toggleCart();
}

function showAuth() {
  hidAllPages();
  document.getElementById('authPage').style.display = 'block';
  toggleAuthForm('login');
}

function showProfile() {
  if (!currentUser) {
    showAuth();
    return;
  }
  hidAllPages();
  loadOrders();
  document.getElementById('profileName').textContent = currentUser.name;
  document.getElementById('profileEmail').textContent = currentUser.email;
  document.getElementById('profilePhone').textContent = currentUser.phone || 'N/A';
  document.getElementById('profileAddress').textContent = currentUser.address || 'N/A';
  document.getElementById('profilePage').style.display = 'block';
  toggleCart();
}

function toggleCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('overlay');
  sidebar.classList.toggle('show');
  overlay.style.display = overlay.style.display === 'none' ? 'block' : 'none';
}

function goToCheckout() {
  if (!currentCart || !currentCart.items.length) {
    alert('Cart is empty');
    return;
  }
  if (!currentUser) {
    alert('Please login to checkout');
    showAuth();
    return;
  }
  hidAllPages();
  document.getElementById('checkoutPage').style.display = 'block';
  toggleCart();
}

function showCart() {
  hidAllPages();
  document.getElementById('homePage').style.display = 'block';
  setTimeout(() => toggleCart(), 100);
}

function showDoctors() {
  hidAllPages();
  loadDoctors();
  document.getElementById('doctorsPage').style.display = 'block';
  toggleCart();
}

function showLabTests() {
  hidAllPages();
  loadLabTests();
  document.getElementById('labTestsPage').style.display = 'block';
  toggleCart();
}

function toggleAuthForm(form = null) {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const authTitle = document.getElementById('authTitle');

  if (!form) {
    if (loginForm.style.display === 'block') {
      form = 'register';
    } else {
      form = 'login';
    }
  }

  if (form === 'login') {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    authTitle.textContent = 'Login';
  } else {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    authTitle.textContent = 'Sign Up';
  }
}

// Doctors Management
function loadDoctors() {
  doctors = generateDoctors(24);
  filteredDoctors = doctors;
  renderDoctors();
}

function renderDoctors() {
  const grid = document.getElementById('doctorsGrid');
  const noDoctors = document.getElementById('noDoctors');

  if (!filteredDoctors.length) {
    grid.innerHTML = '';
    noDoctors.style.display = 'block';
    return;
  }

  noDoctors.style.display = 'none';
  grid.innerHTML = filteredDoctors.map(doctor => `
    <div class="col-12 col-sm-6 col-lg-4">
      <div class="card h-100" style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; transition: all 0.3s;">
        <div style="background: linear-gradient(135deg, #0e7490 0%, #155e75 100%); padding: 1.5rem; text-align: center; color: white;">
          <img src="${doctor.image}" style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid white; margin-bottom: 0.5rem;">
          <h5 class="mb-0">${doctor.name}</h5>
          <small>${doctor.specialization}</small>
        </div>
        <div class="card-body">
          <p class="mb-2"><i class="fas fa-map-marker-alt" style="color: var(--brand);"></i> ${doctor.location}</p>
          <p class="mb-2"><i class="fas fa-graduation-cap" style="color: var(--brand);"></i> ${doctor.experience}</p>
          <p class="mb-2"><i class="fas fa-star" style="color: #fbbf24;"></i> ${doctor.rating}/5</p>
          <div style="padding-top: 0.5rem; border-top: 1px solid #e2e8f0;">
            <span class="badge ${doctor.available ? 'bg-success' : 'bg-danger'}" style="width: 100%; text-align: center; padding: 0.5rem;">
              ${doctor.available ? '✓ Available' : '✗ Not Available'}
            </span>
          </div>
        </div>
        <div class="card-footer bg-light">
          <button class="btn btn-sm btn-primary w-100" ${!currentUser ? 'disabled' : ''} onclick="addTestToCart('doc_${doctor.id}', '${doctor.name} Consultation', 500)">
            <i class="fas fa-phone"></i> Book Consultation
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function filterDoctors() {
  const searchTerm = document.getElementById('doctorSearch').value.toLowerCase();
  filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm) ||
    doctor.specialization.toLowerCase().includes(searchTerm) ||
    doctor.location.toLowerCase().includes(searchTerm)
  );
  renderDoctors();
}

// Lab Tests Management
function loadLabTests() {
  labTests = generateLabTests();
  filteredTests = labTests;
  renderLabTests();
}

function renderLabTests() {
  const grid = document.getElementById('labTestsGrid');
  const noTests = document.getElementById('noLabTests');

  if (!filteredTests.length) {
    grid.innerHTML = '';
    noTests.style.display = 'block';
    return;
  }

  noTests.style.display = 'none';
  grid.innerHTML = filteredTests.map(test => `
    <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
      <div class="card product-card">
        <img src="${test.image}" class="card-img-top" alt="${test.name}" style="height: 200px; object-fit: cover;">
        <div class="card-body d-flex flex-column gap-2">
          <span class="badge-safe">${test.category}</span>
          <h5 class="card-title mb-0">${test.name}</h5>
          <p class="text-muted small mb-1">${test.description}</p>
          <small class="text-muted"><i class="fas fa-clock"></i> Report in ${test.time}</small>
          <div class="price-section mt-auto">
            <span class="price-discount">₹${test.price}</span>
          </div>
          <button class="btn-add-cart" onclick="addTestToCart('test_${test.id}', '${test.name}', ${test.price})">
            <i class="fas fa-plus-circle"></i> Book Test
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function filterTests() {
  const searchTerm = document.getElementById('labSearch').value.toLowerCase();
  filteredTests = labTests.filter(test =>
    test.name.toLowerCase().includes(searchTerm) ||
    test.category.toLowerCase().includes(searchTerm) ||
    test.description.toLowerCase().includes(searchTerm)
  );
  renderLabTests();
}

function addTestToCart(testId, testName, testPrice) {
  if (!currentUser) {
    alert('Please login to book tests');
    showAuth();
    return;
  }

  // Add test as a product to cart
  const testProduct = {
    _id: testId,
    name: testName,
    price: testPrice,
    image: 'https://onemg.gumlet.io/a_ignore,w_380,h_380,c_fit/xyvclpzrsphlp9tvrtxj.jpg',
    category: 'Health Service'
  };

  fetch(`${API_BASE}/api/cart/${currentUser.id}/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId: testId, quantity: 1, customProduct: testProduct })
  })
    .then(res => res.json())
    .then(cart => {
      currentCart = cart;
      updateCartUI();
      alert('Booked! Added to cart');
    })
    .catch(() => {
      // Fallback if backend doesn't support custom products
      alert('Added to cart!');
      if (!currentCart) currentCart = { items: [] };
      const existingItem = currentCart.items.find(item => item.productId === testId);
      if (existingItem) {
        existingItem.quantity++;
      } else {
        currentCart.items.push({
          productId: testId,
          name: testName,
          price: testPrice,
          image: 'https://onemg.gumlet.io/a_ignore,w_380,h_380,c_fit/xyvclpzrsphlp9tvrtxj.jpg',
          quantity: 1
        });
      }
      currentCart.totalPrice = currentCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      updateCartUI();
    });
}

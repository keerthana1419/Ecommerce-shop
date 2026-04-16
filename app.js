const API = 'http://localhost:3000/api';
let cart = JSON.parse(localStorage.getItem('cart') || '[]');
let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
let allProducts = [];
let activeCat = '';
let currentDetailId = null;
let pendingAction = null;

// ─── INIT ────────────────────────────────────────────────
window.onload = () => {
  loadProducts();
  renderCart();
  renderWishCount();
  buildDropdown();
};

// Close dropdown when clicking outside
document.addEventListener('click', e => {
  const dd = document.getElementById('userDropdown');
  if (dd && !dd.contains(e.target)) closeDropdown();
});

// ─── DROPDOWN ────────────────────────────────────────────
function buildDropdown() {
  const name = localStorage.getItem('userName');
  const btn = document.getElementById('userBtnLabel');
  const menu = document.getElementById('dropdownMenu');

  if (name) {
    btn.textContent = name;
    menu.innerHTML = `
      <div class="dropdown-header">
        <div class="dropdown-avatar">${name.charAt(0).toUpperCase()}</div>
        <div>
          <div class="dropdown-name">${name}</div>
          <div class="dropdown-email">${localStorage.getItem('userEmail') || ''}</div>
        </div>
      </div>
      <div class="dropdown-divider"></div>
      <a class="dropdown-item" href="profile.html"><i class="fas fa-user"></i> My Account</a>
      <a class="dropdown-item" href="orders.html"><i class="fas fa-box"></i> Order History</a>
      <div class="dropdown-divider"></div>
      <button class="dropdown-item dropdown-logout" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Logout</button>
    `;
  } else {
    btn.textContent = 'Account';
    menu.innerHTML = `
      <a class="dropdown-item" onclick="closeDropdown(); openModal('loginModal')"><i class="fas fa-sign-in-alt"></i> Login</a>
      <a class="dropdown-item" onclick="closeDropdown(); openModal('registerModal')"><i class="fas fa-user-plus"></i> Register</a>
    `;
  }
}

function toggleDropdown() {
  const menu = document.getElementById('dropdownMenu');
  const chevron = document.getElementById('dropChevron');
  const isOpen = menu.classList.contains('open');
  menu.classList.toggle('open', !isOpen);
  chevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
}

function closeDropdown() {
  const menu = document.getElementById('dropdownMenu');
  const chevron = document.getElementById('dropChevron');
  if (menu) { menu.classList.remove('open'); chevron.style.transform = 'rotate(0deg)'; }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  location.reload();
}

// ─── AUTH CHECK ──────────────────────────────────────────
function isLoggedIn() { return !!localStorage.getItem('token'); }

function requireLogin(action, message) {
  if (isLoggedIn()) { action(); return; }
  pendingAction = action;
  document.getElementById('authGateMsg').textContent = message || 'Please login or create an account to continue.';
  openModal('authGateModal');
}

function switchToLogin()    { closeModal('authGateModal'); openModal('loginModal'); }
function switchToRegister() { closeModal('authGateModal'); openModal('registerModal'); }

// ─── CART / WISHLIST NAV BUTTONS ─────────────────────────
function handleCartOpen() {
  requireLogin(() => toggleCart(), 'Please login or register to view your cart.');
}

function handleWishlistOpen() {
  requireLogin(() => { renderWishCount(); openModal('wishlistModal'); }, 'Please login or register to view your wishlist.');
}

// ─── PRODUCTS ────────────────────────────────────────────
async function loadProducts() {
  try {
    const res = await fetch(`${API}/products`);
    allProducts = await res.json();
    renderProducts(allProducts);
  } catch {
    allProducts = [
      { id:1,  name:'Wireless Headphones',  category:'Electronics', price:59.99,  image:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',  desc:'Premium wireless headphones with noise cancellation, 30hr battery life and deep bass sound.' },
      { id:2,  name:'Smart Watch',           category:'Electronics', price:199.99, image:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',  desc:'Smart watch with heart rate monitor, GPS, sleep tracking and 7-day battery.' },
      { id:3,  name:'Bluetooth Speaker',     category:'Electronics', price:79.99,  image:'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',  desc:'Portable Bluetooth speaker with 360 surround sound, waterproof and 12hr playtime.' },
      { id:4,  name:'Laptop Stand',          category:'Electronics', price:39.99,  image:'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',  desc:'Ergonomic aluminum laptop stand, adjustable height, compatible with all laptops.' },
      { id:5,  name:'Mechanical Keyboard',   category:'Electronics', price:119.99, image:'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400',  desc:'RGB mechanical keyboard with tactile switches, anti-ghosting and USB-C connection.' },
      { id:6,  name:'Wireless Mouse',        category:'Electronics', price:34.99,  image:'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',  desc:'Ergonomic wireless mouse with silent clicks, 12-month battery and 3 DPI levels.' },
      { id:7,  name:'Running Shoes',         category:'Clothing',    price:89.99,  image:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',  desc:'Lightweight running shoes with cushioned sole, breathable mesh and anti-slip grip.' },
      { id:8,  name:'Backpack',              category:'Clothing',    price:49.99,  image:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',  desc:'Durable 30L backpack with laptop compartment, water-resistant and ergonomic straps.' },
      { id:9,  name:'Denim Jacket',          category:'Clothing',    price:69.99,  image:'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400',  desc:'Classic denim jacket with slim fit, button closure and two chest pockets.' },
      { id:10, name:'Sports T-Shirt',        category:'Clothing',    price:24.99,  image:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',  desc:'Moisture-wicking sports t-shirt, quick-dry fabric, available in multiple colors.' },
      { id:11, name:'Sunglasses',            category:'Clothing',    price:44.99,  image:'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400',  desc:'UV400 polarized sunglasses with lightweight frame and scratch-resistant lenses.' },
      { id:12, name:'Sneakers',              category:'Clothing',    price:74.99,  image:'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400',  desc:'Casual sneakers with memory foam insole, rubber outsole and lace-up closure.' },
      { id:13, name:'JavaScript Book',       category:'Books',       price:29.99,  image:'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',  desc:'Comprehensive JavaScript guide covering ES6+, async/await, DOM, and modern frameworks.' },
      { id:14, name:'UI/UX Design Guide',    category:'Books',       price:34.99,  image:'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',  desc:'Complete UI/UX design handbook with real-world case studies and Figma tutorials.' },
      { id:15, name:'Python Programming',    category:'Books',       price:27.99,  image:'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400',  desc:'Python from beginner to advanced — covers data science, automation and web dev.' },
      { id:16, name:'Business Strategy',     category:'Books',       price:22.99,  image:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',  desc:'Proven business strategies and frameworks used by Fortune 500 companies.' },
      { id:17, name:'Self Development',      category:'Books',       price:18.99,  image:'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',  desc:'Transform your mindset and habits with science-backed self-improvement techniques.' },
      { id:18, name:'Data Structures',       category:'Books',       price:31.99,  image:'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400',  desc:'Master data structures and algorithms with visual explanations and coding exercises.' },
      { id:19, name:'Desk Lamp',             category:'Home',        price:34.99,  image:'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400',  desc:'LED desk lamp with adjustable brightness, USB charging port and eye-care mode.' },
      { id:20, name:'Coffee Maker',          category:'Home',        price:44.99,  image:'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',  desc:'Programmable coffee maker with thermal carafe, auto-brew timer and keep-warm plate.' },
      { id:21, name:'Air Purifier',          category:'Home',        price:129.99, image:'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400',  desc:'HEPA air purifier removes 99.97% of dust, pollen and allergens. Ultra-quiet.' },
      { id:22, name:'Scented Candles Set',   category:'Home',        price:19.99,  image:'https://images.unsplash.com/photo-1602607144535-11e7a4a87a0f?w=400',  desc:'Set of 6 premium scented candles with natural soy wax and 40hr burn time each.' },
      { id:23, name:'Wall Clock',            category:'Home',        price:29.99,  image:'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=400',  desc:'Modern minimalist wall clock with silent sweep movement and wooden frame.' },
      { id:24, name:'Throw Blanket',         category:'Home',        price:39.99,  image:'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=400',  desc:'Super soft fleece throw blanket, machine washable, 150x200cm, multiple colors.' },
    ];
    renderProducts(allProducts);
  }
}

function renderProducts(products) {
  const grid = document.getElementById('productsGrid');
  if (!products.length) { grid.innerHTML = '<p style="padding:20px;color:#888">No products found.</p>'; return; }
  grid.innerHTML = products.map(p => {
    const wished = wishlist.some(w => w.id === p.id);
    return `
    <div class="product-card" onclick="openProductDetail(${p.id})">
      <div class="card-img-wrap">
        <img src="${p.image}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/400x200?text=No+Image'"/>
        <button class="wish-icon ${wished ? 'wished' : ''}" onclick="event.stopPropagation(); handleWish(${p.id})" title="Wishlist">
          <i class="fas fa-heart"></i>
        </button>
      </div>
      <div class="product-info">
        <p class="category">${p.category}</p>
        <h3>${p.name}</h3>
        <p class="price">$${parseFloat(p.price).toFixed(2)}</p>
        <button class="btn-primary" onclick="event.stopPropagation(); handleAddToCart(${p.id})">
          <i class="fas fa-cart-plus"></i> Add to Cart
        </button>
      </div>
    </div>`;
  }).join('');
}

function filterProducts() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  renderProducts(allProducts.filter(p =>
    p.name.toLowerCase().includes(q) && (activeCat === '' || p.category === activeCat)
  ));
}

function setPill(el, cat) {
  activeCat = cat;
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  filterProducts();
}

// ─── PRODUCT DETAIL ──────────────────────────────────────
function openProductDetail(id) {
  const p = allProducts.find(x => x.id === id);
  if (!p) return;
  currentDetailId = id;
  document.getElementById('pdImage').src = p.image;
  document.getElementById('pdCategory').textContent = p.category;
  document.getElementById('pdName').textContent = p.name;
  document.getElementById('pdPrice').textContent = '$' + parseFloat(p.price).toFixed(2);
  document.getElementById('pdDesc').textContent = p.desc || 'High quality product.';
  document.getElementById('pdCartBtn').onclick = () => { handleAddToCart(id); closeModal('productModal'); };
  updateDetailWishBtn(id);
  openModal('productModal');
}

function updateDetailWishBtn(id) {
  const btn = document.getElementById('pdWishBtn');
  const wished = wishlist.some(w => w.id === id);
  btn.classList.toggle('wished', wished);
  btn.innerHTML = '<i class="fas fa-heart"></i> ' + (wished ? 'Wishlisted' : 'Wishlist');
}

function toggleWishFromDetail() {
  if (currentDetailId) { handleWish(currentDetailId); updateDetailWishBtn(currentDetailId); }
}

// ─── AUTH-GATED ACTIONS ──────────────────────────────────
function handleAddToCart(id) {
  requireLogin(() => addToCart(id), 'Please login or register to add items to your cart.');
}
function handleWish(id) {
  requireLogin(() => toggleWish(id), 'Please login or register to save items to your wishlist.');
}

// ─── CART ────────────────────────────────────────────────
function addToCart(id) {
  const product = allProducts.find(p => p.id === id);
  if (!product) return;
  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty++;
  else cart.push({ ...product, qty: 1 });
  saveCart(); renderCart();
  showToast('"' + product.name + '" added to cart!');
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  saveCart(); renderCart();
}

function renderCart() {
  const container = document.getElementById('cartItems');
  const totalEl   = document.getElementById('cartTotal');
  const subtotalEl = document.getElementById('cartSubtotal');
  const countEl   = document.getElementById('cartCount');
  countEl.textContent = cart.reduce((s, i) => s + i.qty, 0);
  if (!cart.length) {
    container.innerHTML = '<div style="text-align:center;padding:50px 20px;color:#aaa"><i class="fas fa-shopping-cart" style="font-size:2.5rem;margin-bottom:12px;display:block;color:#e0e0e0"></i><p>Your cart is empty</p></div>';
    if (totalEl) totalEl.textContent = '$0.00';
    if (subtotalEl) subtotalEl.textContent = '$0.00';
    return;
  }
  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/68'"/>
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <div class="cart-item-cat">${item.category}</div>
        <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
      </div>
      <div class="cart-item-controls">
        <button onclick="changeQty(${item.id},-1)">&#8722;</button>
        <span>${item.qty}</span>
        <button onclick="changeQty(${item.id},1)">&#43;</button>
      </div>
    </div>`).join('');
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  if (totalEl) totalEl.textContent = '$' + total.toFixed(2);
  if (subtotalEl) subtotalEl.textContent = '$' + total.toFixed(2);
}

function saveCart() { localStorage.setItem('cart', JSON.stringify(cart)); }

function toggleCart() {
  document.getElementById('cartSidebar').classList.toggle('open');
  document.getElementById('cartOverlay').classList.toggle('open');
}

function goCheckout() {
  if (!cart.length) { showToast('Your cart is empty!'); return; }
  window.location.href = 'checkout.html';
}

// ─── WISHLIST ────────────────────────────────────────────
function toggleWish(id) {
  const product = allProducts.find(p => p.id === id);
  if (!product) return;
  const idx = wishlist.findIndex(w => w.id === id);
  if (idx >= 0) { wishlist.splice(idx, 1); showToast('"' + product.name + '" removed from wishlist'); }
  else          { wishlist.push(product);  showToast('"' + product.name + '" added to wishlist!'); }
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  renderWishCount(); filterProducts();
}

function renderWishCount() {
  document.getElementById('wishCount').textContent = wishlist.length;
  const container = document.getElementById('wishlistItems');
  if (!container) return;
  if (!wishlist.length) { container.innerHTML = '<p style="text-align:center;color:#aaa;margin-top:20px">Your wishlist is empty</p>'; return; }
  container.innerHTML = wishlist.map(p => `
    <div class="wish-item">
      <img src="${p.image}" alt="${p.name}"/>
      <div class="wish-item-info"><h4>${p.name}</h4><p>$${parseFloat(p.price).toFixed(2)}</p></div>
      <div class="wish-item-actions">
        <button class="btn-primary" style="padding:7px 14px;font-size:0.85rem" onclick="addToCart(${p.id}); closeModal('wishlistModal')"><i class="fas fa-cart-plus"></i></button>
        <button class="btn-remove" onclick="toggleWish(${p.id}); renderWishCount()"><i class="fas fa-trash"></i></button>
      </div>
    </div>`).join('');
}

// ─── AUTH ────────────────────────────────────────────────
async function login() {
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const msg      = document.getElementById('loginMsg');
  if (!email || !password) { setMsg(msg, 'Fill all fields', 'error'); return; }
  try {
    const res  = await fetch(`${API}/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password }) });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userName', data.name);
      localStorage.setItem('userEmail', email);
      setMsg(msg, 'Login successful!', 'success');
      afterLogin();
    } else { setMsg(msg, data.message || 'Login failed', 'error'); }
  } catch {
    // Server offline - check localStorage
    const users = JSON.parse(localStorage.getItem('offlineUsers') || '[]');
    if (!users.length) {
      setMsg(msg, 'Server offline. Please register first.', 'error');
      return;
    }
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      localStorage.setItem('token', 'offline_' + email);
      localStorage.setItem('userName', user.name);
      localStorage.setItem('userEmail', email);
      setMsg(msg, 'Welcome back, ' + user.name + '!', 'success');
      afterLogin();
    } else {
      setMsg(msg, 'Invalid email or password.', 'error');
    }
  }
}

async function register() {
  const name     = document.getElementById('regName').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const msg      = document.getElementById('registerMsg');
  if (!name || !email || !password) { setMsg(msg, 'Fill all fields', 'error'); return; }
  
  // Basic email validation
  if (!email.includes('@') || !email.includes('.')) {
    setMsg(msg, 'Please enter a valid email address', 'error');
    return;
  }
  
  // Basic password validation
  if (password.length < 6) {
    setMsg(msg, 'Password must be at least 6 characters', 'error');
    return;
  }
  
  try {
    const res  = await fetch(`${API}/register`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name, email, password }) });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', 'online_' + email);
      localStorage.setItem('userName', name);
      localStorage.setItem('userEmail', email);
      setMsg(msg, 'Account created! Welcome, ' + name + '!', 'success');
      afterLogin();
    } else { setMsg(msg, data.message || 'Registration failed', 'error'); }
  } catch {
    // Server offline - save locally
    const users = JSON.parse(localStorage.getItem('offlineUsers') || '[]');
    if (users.find(u => u.email === email)) { setMsg(msg, 'Email already registered', 'error'); return; }
    users.push({ name, email, password });
    localStorage.setItem('offlineUsers', JSON.stringify(users));
    localStorage.setItem('token', 'offline_' + email);
    localStorage.setItem('userName', name);
    localStorage.setItem('userEmail', email);
    setMsg(msg, 'Account created! Welcome, ' + name + '!', 'success');
    afterLogin();
  }
}

function afterLogin() {
  buildDropdown();
  setTimeout(() => {
    closeModal('loginModal');
    closeModal('registerModal');
    if (pendingAction) { pendingAction(); pendingAction = null; }
  }, 800);
}

// ─── HELPERS ─────────────────────────────────────────────
function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
function setMsg(el, text, type) { el.textContent = text; el.className = 'msg ' + type; }
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

let cart = JSON.parse(localStorage.getItem('cart') || '[]');
let discount = 0;
let currentStep = 1;
let selectedPayMethod = 'card';

window.onload = () => {
  if (!cart.length) { window.location.href = 'index.html'; return; }
  renderSummary();
  document.querySelectorAll('input[name="shipping"]').forEach(r =>
    r.addEventListener('change', renderSummary)
  );
};

// ─── SUMMARY ─────────────────────────────────────────────
function renderSummary() {
  const container = document.getElementById('summaryItems');
  container.innerHTML = cart.map(item => `
    <div class="summary-item">
      <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/52?text=?'"/>
      <div class="summary-item-info">
        <h4>${item.name}</h4>
        <p>Qty: ${item.qty}</p>
      </div>
      <span class="summary-item-price">$${(item.price * item.qty).toFixed(2)}</span>
    </div>
  `).join('');

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shippingVal = parseFloat(document.querySelector('input[name="shipping"]:checked')?.value || 0);
  const tax = (subtotal - discount) * 0.08;
  const total = subtotal - discount + shippingVal + tax;

  document.getElementById('summarySubtotal').textContent = '$' + subtotal.toFixed(2);
  document.getElementById('summaryShipping').textContent = shippingVal === 0 ? 'FREE' : '$' + shippingVal.toFixed(2);
  document.getElementById('summaryTax').textContent = '$' + tax.toFixed(2);
  document.getElementById('summaryTotal').textContent = '$' + total.toFixed(2);
}

// ─── STEPS ───────────────────────────────────────────────
function goToStep(step) {
  if (step === 2 && !validateStep1()) return;
  if (step === 3) buildConfirm();

  document.getElementById('step' + currentStep).classList.add('hidden');
  document.getElementById('step' + step).classList.remove('hidden');

  // update indicators
  for (let i = 1; i <= 3; i++) {
    const ind = document.getElementById('step' + i + 'Ind');
    ind.classList.remove('active', 'done');
    if (i < step) ind.classList.add('done');
    else if (i === step) ind.classList.add('active');
  }
  currentStep = step;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function validateStep1() {
  const fields = ['firstName', 'lastName', 'shipEmail', 'phone', 'address', 'city', 'zip', 'country'];
  for (const id of fields) {
    const el = document.getElementById(id);
    if (!el.value.trim()) {
      el.focus();
      el.style.borderColor = '#e94560';
      showToast('Please fill in all shipping details.');
      setTimeout(() => el.style.borderColor = '', 2000);
      return false;
    }
  }
  return true;
}

function buildConfirm() {
  const shippingVal = parseFloat(document.querySelector('input[name="shipping"]:checked')?.value || 0);
  const shippingLabel = shippingVal === 0 ? 'Standard (FREE)' : shippingVal === 9.99 ? 'Express ($9.99)' : 'Overnight ($19.99)';
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = (subtotal - discount) * 0.08;
  const total = subtotal - discount + shippingVal + tax;

  const payLabels = { card: 'Credit / Debit Card', paypal: 'PayPal', cod: 'Cash on Delivery' };

  document.getElementById('confirmDetails').innerHTML = `
    <div class="confirm-block">
      <h4>Shipping Address</h4>
      <p>${document.getElementById('firstName').value} ${document.getElementById('lastName').value}<br>
         ${document.getElementById('address').value}, ${document.getElementById('city').value} ${document.getElementById('zip').value}<br>
         ${document.getElementById('country').value}<br>
         ${document.getElementById('phone').value}</p>
    </div>
    <div class="confirm-block">
      <h4>Shipping Method</h4>
      <p>${shippingLabel}</p>
    </div>
    <div class="confirm-block">
      <h4>Payment Method</h4>
      <p>${payLabels[selectedPayMethod]}</p>
    </div>
    <div class="confirm-block">
      <h4>Order Total</h4>
      <p style="font-size:1.2rem;font-weight:bold;color:#e94560">$${total.toFixed(2)}</p>
    </div>
  `;
}

// ─── PAYMENT TABS ─────────────────────────────────────────
function setPayTab(el, method) {
  selectedPayMethod = method;
  document.querySelectorAll('.pay-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('cardForm').classList.add('hidden');
  document.getElementById('paypalForm').classList.add('hidden');
  document.getElementById('codForm').classList.add('hidden');
  document.getElementById(method + 'Form').classList.remove('hidden');
}

// ─── PROMO CODE ───────────────────────────────────────────
function applyPromo() {
  const code = document.getElementById('promoInput').value.trim().toUpperCase();
  const msg = document.getElementById('promoMsg');
  const promos = { 'SAVE10': 10, 'SHOP20': 20, 'WELCOME5': 5 };

  if (promos[code]) {
    discount = promos[code];
    msg.textContent = 'Promo applied! $' + discount + ' off your order.';
    msg.className = 'promo-msg success';
    renderSummary();
  } else {
    discount = 0;
    msg.textContent = 'Invalid promo code.';
    msg.className = 'promo-msg error';
    renderSummary();
  }
}

// ─── PLACE ORDER ─────────────────────────────────────────
function placeOrder() {
  const orderId = 'SZ-' + Date.now().toString().slice(-8);
  document.getElementById('orderId').textContent = orderId;

  // Save order to localStorage
  const shippingVal = parseFloat(document.querySelector('input[name="shipping"]:checked')?.value || 0);
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = (subtotal - discount) * 0.08;
  const total = subtotal - discount + shippingVal + tax;
  const payLabels = { card: 'Credit / Debit Card', paypal: 'PayPal', cod: 'Cash on Delivery' };

  const order = {
    id: orderId,
    date: new Date().toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' }),
    items: cart,
    subtotal: subtotal.toFixed(2),
    shipping: shippingVal.toFixed(2),
    tax: tax.toFixed(2),
    total: total.toFixed(2),
    payMethod: payLabels[selectedPayMethod],
    address: document.getElementById('firstName').value + ' ' + document.getElementById('lastName').value + ', ' +
             document.getElementById('address').value + ', ' + document.getElementById('city').value + ' ' +
             document.getElementById('zip').value + ', ' + document.getElementById('country').value,
    status: 'Processing'
  };

  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  orders.unshift(order);
  localStorage.setItem('orders', JSON.stringify(orders));
  localStorage.removeItem('cart');

  document.getElementById('step3').classList.add('hidden');
  document.getElementById('step4').classList.remove('hidden');
  for (let i = 1; i <= 3; i++) {
    document.getElementById('step' + i + 'Ind').classList.remove('active');
    document.getElementById('step' + i + 'Ind').classList.add('done');
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── CARD FORMATTERS ─────────────────────────────────────
function formatCard(el) {
  let v = el.value.replace(/\D/g, '').substring(0, 16);
  el.value = v.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(el) {
  let v = el.value.replace(/\D/g, '').substring(0, 4);
  if (v.length >= 3) v = v.substring(0, 2) + '/' + v.substring(2);
  el.value = v;
}

// ─── TOAST ───────────────────────────────────────────────
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

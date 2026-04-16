const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const SECRET = 'shopzone_secret_key';

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// ─── AUTH MIDDLEWARE ─────────────────────────────────────
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// ─── REGISTER ────────────────────────────────────────────
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'All fields required' });

  const hash = await bcrypt.hash(password, 10);
  db.query(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, hash],
    (err) => {
      if (err) return res.status(400).json({ message: 'Email already exists' });
      res.json({ message: 'Registered successfully' });
    }
  );
});

// ─── LOGIN ───────────────────────────────────────────────
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, rows) => {
    if (err || !rows.length)
      return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, rows[0].password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: rows[0].id, email }, SECRET, { expiresIn: '7d' });
    res.json({ token, name: rows[0].name });
  });
});

// ─── PRODUCTS ────────────────────────────────────────────
app.get('/api/products', (req, res) => {
  db.query('SELECT * FROM products', (err, rows) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    res.json(rows);
  });
});

app.post('/api/products', authMiddleware, (req, res) => {
  const { name, category, price, image } = req.body;
  db.query(
    'INSERT INTO products (name, category, price, image) VALUES (?, ?, ?, ?)',
    [name, category, price, image],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'DB error' });
      res.json({ id: result.insertId, name, category, price, image });
    }
  );
});

// ─── ORDERS ──────────────────────────────────────────────
app.post('/api/orders', authMiddleware, (req, res) => {
  const { items, total } = req.body;
  db.query(
    'INSERT INTO orders (user_id, items, total) VALUES (?, ?, ?)',
    [req.user.id, JSON.stringify(items), total],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'DB error' });
      res.json({ message: 'Order placed', orderId: result.insertId });
    }
  );
});

app.get('/api/orders', authMiddleware, (req, res) => {
  db.query(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'DB error' });
      res.json(rows);
    }
  );
});

// ─── START ───────────────────────────────────────────────
app.listen(3000, () => console.log('✅ Server running at http://localhost:3000'));

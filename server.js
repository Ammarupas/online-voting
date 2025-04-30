const express = require('express');
const path = require('path');
const app = express();
require('dotenv').config();

// ✅ Import routes
const authRoutes = require('./routes/authRoutes');
const voteRoutes = require('./routes/voteRoutes');

// ✅ Import MySQL connection
const db = require('./db'); // make sure db.js is correctly configured

// ✅ Middleware: parse incoming requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Route handlers
app.use('/auth', authRoutes);   // Handles register, login
app.use('/vote', voteRoutes);   // Handles voting

// ✅ Voting results endpoint (used by results.html)
app.get('/results', (req, res) => {
  const query = 'SELECT name, party, votes FROM candidates ORDER BY votes DESC';
  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Error fetching results:', err);
      return res.status(500).json({ error: 'Failed to fetch results' });
    }
    res.json(results);
  });
});

// ✅ Default route for homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// ✅ Catch-all 404 page
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

// ✅ Load environment variables from .env file
dotenv.config();

const app = express();

// ✅ Import route modules
const authRoutes = require('./routes/authRoutes');
const voteRoutes = require('./routes/voteRoutes');

// ✅ Middleware to parse incoming requests
app.use(express.urlencoded({ extended: true })); // Parses HTML form submissions
app.use(express.json());                         // Parses JSON bodies (e.g., fetch API)

// ✅ Serve static frontend files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Mount route handlers
app.use('/auth', authRoutes);   // Handles /auth/register, /auth/login
app.use('/', voteRoutes);       // Handles /vote and /results (declared inside voteRoutes)

// ✅ Default homepage (e.g., register.html or index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// ✅ Catch-all route for 404 errors
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// ✅ Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error details
  res.status(500).send('Something went wrong!'); // Send a generic error message
});

// ✅ Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

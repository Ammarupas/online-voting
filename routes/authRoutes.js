const express = require('express');
const router = express.Router();
const db = require('../db');

// REGISTER
router.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
  db.query(query, [name, email, password], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error during registration');
    }

    const voterId = result.insertId; // 👈 Get auto-incremented user ID

    // Show message with voter ID
    res.send(`
      <h3>Registration successful!</h3>
      <p>Your Voter ID is: <strong>${voterId}</strong></p>
      <a href="/login.html">Go to Login</a>
    `);
  });
});

// LOGIN
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
  db.query(query, [email, password], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server error');
    }
    if (results.length > 0) {
      const user = results[0];
      const voterId = user.id; // 👈 Get voter ID from DB

      // Redirect to voting page with voter ID as query param
      res.redirect(`/vote.html?voterId=${voterId}`);
    } else {
      res.status(401).send('Invalid email or password');
    }
  });
});

// VOTING
router.post('/vote', (req, res) => {
  const { voterId, candidateId } = req.body;

  const query = 'INSERT INTO votes (voter_id, candidate_id) VALUES (?, ?)';
  db.query(query, [voterId, candidateId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error casting vote');
    }
    res.send(`
      <h3>Vote cast successfully!</h3>
      <a href="/vote.html?voterId=${voterId}">Back to Voting</a>
    `);
  });
});

module.exports = router;

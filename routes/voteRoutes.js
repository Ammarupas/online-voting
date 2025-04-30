const express = require('express');
const path = require('path');
const router = express.Router();
const db = require('../db');

// ✅ Show voting form at GET /vote
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'vote.html'));
});

// ✅ Handle vote submission at POST /vote
router.post('/', (req, res) => {
  const { voterId, candidateId } = req.body;

  console.log('📥 Incoming vote:', req.body);

  // Validate input
  if (!voterId || !candidateId) {
    return res.status(400).json({ message: 'Missing voter ID or candidate ID' });
  }

  // Check if voter already voted
  const checkQuery = 'SELECT * FROM votes WHERE voter_id = ?';
  db.query(checkQuery, [voterId], (checkErr, checkResult) => {
    if (checkErr) {
      console.error('❌ Error checking vote:', checkErr);
      return res.status(500).json({ message: 'Error checking vote' });
    }

    if (checkResult.length > 0) {
      return res.status(403).json({ message: 'You have already voted.' });
    }

    // Begin transaction
    db.beginTransaction((transactionErr) => {
      if (transactionErr) {
        console.error('❌ Error starting transaction:', transactionErr);
        return res.status(500).json({ message: 'Transaction start error' });
      }

      const insertVote = 'INSERT INTO votes (voter_id, candidate_id) VALUES (?, ?)';
      db.query(insertVote, [voterId, candidateId], (voteErr) => {
        if (voteErr) {
          return db.rollback(() => {
            console.error('❌ Error inserting vote:', voteErr);
            res.status(500).json({ message: 'Failed to insert vote' });
          });
        }

        const updateUser = 'UPDATE users SET has_voted = 1 WHERE id = ?';
        db.query(updateUser, [voterId], (userErr) => {
          if (userErr) {
            return db.rollback(() => {
              console.error('❌ Error updating user status:', userErr);
              res.status(500).json({ message: 'Failed to update user status' });
            });
          }

          const updateCandidate = 'UPDATE candidates SET votes = votes + 1 WHERE id = ?';
          db.query(updateCandidate, [candidateId], (candErr) => {
            if (candErr) {
              return db.rollback(() => {
                console.error('❌ Error updating candidate votes:', candErr);
                res.status(500).json({ message: 'Failed to update candidate vote count' });
              });
            }

            // Commit transaction
            db.commit((commitErr) => {
              if (commitErr) {
                return db.rollback(() => {
                  console.error('❌ Commit failed:', commitErr);
                  res.status(500).json({ message: 'Transaction commit failed' });
                });
              }

              console.log('✅ Vote successfully cast by voter ID:', voterId);

              const contentType = req.headers['content-type'] || '';
              if (contentType.includes('application/x-www-form-urlencoded')) {
                res.redirect('/success.html');
              } else {
                res.status(200).json({ message: 'Vote cast successfully!' });
              }
            });
          });
        });
      });
    });
  });
});

module.exports = router;

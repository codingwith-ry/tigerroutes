const express = require('express');


module.exports = (db) => {
    const router = express.Router();
    
    router.post('/assessment/complete', (req, res) => {
        const { studentAccount_ID, riasecScores, bigFiveScores } = req.body;
        const riasecResult = JSON.stringify(riasecScores);
        const bigFiveResult = JSON.stringify(bigFiveScores);
        const timestamp = new Date();
        const query = `INSERT INTO tbl_assessments (studentAccount_ID, riasec_result, bigfive_result, date_taken) VALUES (?, ?, ?, ?)`;
        db.query(query, [studentAccount_ID, riasecResult, bigFiveResult, timestamp], (err, result) => {
            if (err) {
                console.error('Error saving assessment results:', err);
                return res.status(500).json({ success: false, error: 'Database error' });
            }
            res.json({ success: true });
        });
    });
    
    return router;
}



//This file is where we keep all login/register API routes
const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');

module.exports = (db) => {
    const router = express.Router();

    router.get('/strands', (req, res) => {
        db.query('SELECT * FROM tbl_strands', (err, results) => {
            if (err) return res.status(500).json({ error: err.message});
            res.json(results);
        });
    });

    router.get('/student/:id', (req, res) => {
        const id = req.params.id;
        db.query('SELECT * FROM tbl_studentaccounts WHERE studentAccount_ID', [id], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            if (results.length > 0) {
                res.json(results[0]);
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        })
    })

    router.put('/student/:id', (req, res) => {
        const { id } = req.params;
        const { firstName, lastName } = req.body;
        const fullName = firstName + ' ' + lastName;
        db.query(
            'UPDATE tbl_studentaccounts SET name = ? WHERE studentAccount_ID = ?',
            [fullName, id],
            (err, result) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true });
            }
        );
    });

    
    return router;
}
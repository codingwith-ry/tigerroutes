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
    return router;
}
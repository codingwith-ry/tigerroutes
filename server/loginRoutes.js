//This file is where we keep all login/register API routes
const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const secret = 'greenP1ace'

module.exports = (db) => {
    const router = express.Router();
    const client = new OAuth2Client();
    const resetCodes = {};

    // Register endpoint
    router.post('/register', (req, res) => {
        const { name, email, password } = req.body;
        if (name, !email || !password) {
            return res.status(400).json({error: 'Please fill in all fields'});
        }
        db.query(
            'INSERT into tbl_studentaccounts (name, email, password) VALUES (?, ?, ?)',
            [name, email, password],
            (err, result) => {
                if (err) return res.status(500).json({error: err.message});
                res.json({success:true, id: result.insertId});
            }
        )
    });

    // Login Endpoint
    router.post('/login', (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required'});
        }
        db.query(
            'SELECT * FROM tbl_studentaccounts WHERE email = ? AND password = ?',
            [email, password],
            (err, results) => {
                if (err) return res.status(500).json({ error: err.message});
                if (results.length > 0) {
                    const user = results[0];
                    const token = jwt.sign(
                        { id: user.studentAccount_ID, email: user.email },
                        secret,
                        { expiresIn: '1h' }
                    );

                    const cookieMaxAge = req.body.rememberMe
                        ? 30 * 24 * 60 * 60 * 1000
                        : 7 * 24 * 60 * 60 * 1000;

                        res.cookie('tigerToken', token, {
                            httpOnly: true,
                            secure: false,      // false because you're on localhost without HTTPS
                            sameSite: 'lax',    // lax is safe for dev
                            maxAge: cookieMaxAge
                        });
                    res.json({ success: true, user: results[0] });
                } else {
                    // No match
                    res.json({ success: false, error: 'Invalid email or password' });
                }
            }
        )
    });

    //reset password and mailers
    router.post('/forgot-password', async (req, res) => {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        //Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = Date.now() + 10 * 60 * 1000;
        resetCodes[email] = { code, expires };

        //Nodemailer transporter
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'dominicxandy.adino.cics@ust.edu.ph', //change this email
                pass: 'fdvp mbeg iold wmfe'//put password here
            }
        });

        const mailOptions = {
            from: 'dominicxandy.adino.cics@ust.edu.ph',
            to: email,
            subject: 'TigerRoutes Password Reset',
            html: `
            <p>Your password reset code is: <b>${code}</b></p>
            <p>Or click <a href="http://localhost:3000/otp?email=${encodeURIComponent(email)}&code=${code}">here</a> to enter your code.</p>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: 'Failed to send email.' });
        }
    });


    //verifying the reset code
    router.post('/verify-reset', (req, res) => {
        const { email, code } = req.body;
        const entry = resetCodes[email];
        if (!entry) return res.status(400).json({ error: 'No reset code found.' });
        if (Date.now() > entry.expires) return res.status(400).json({ error: 'Code expired.' });
        if (entry.code !== code) return res.status(400).json({ error: 'Invalid Code.'});
        delete resetCodes[email];
        res.json({ success: true });
    });

    //resetting the password itself
    router.post('/reset-password', (req,res) => {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and new password required'});
        }
        db.query(
            'UPDATE tbl_studentaccounts SET password = ? WHERE email = ?',
            [password, email],
            (err, results) => {
                if (err) return res.status(500).json({ error: err.message});
                if (results.affectedRows === 0 ) {
                    return res.status(404).json({ error: 'Account not found.'});
                }
                res.json({ success: true });
            }
        )
    });

    //token verification using Google API
    async function verify(token) {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: "64875843215-fujh9oveth87r16ir4qvu7psoc098j0h.apps.googleusercontent.com", //Client ID
        });
        const payload = ticket.getPayLoad();
    }

    //Authentication with Google
    router.post('/google-auth', (req, res) => {
        const { email, name } = req.body;
        if (!email || !name) {
            return res.status(400).json({ error: 'Missing email or name' });
        }
        db.query(
            'SELECT * FROM tbl_studentaccounts WHERE email = ?',
            [email],
            (err, results) => {
                if (err) return res.status(500).json({ error: err.message });
                if (results.length > 0) {
                    return res.json({ success: true, isNew: false, user: results[0]});
                } else {
                    db.query(
                        'INSERT INTO tbl_studentaccounts (name, email, password) VALUES (?, ?, ?)',
                        [name, email, ''],
                        (err2, result2) => {
                            if (err2) return res.status(500).json({ error: err2.message });

                            db.query(
                                'SELECT * FROM tbl_studentaccounts WHERE email = ?',
                                [email],
                                (err3, newResults) => {
                                    if (err3) return res.status(500).json({ error: err3.message });
                                    return res.json({ success: true, isNew: true, user: newResults[0]});
                                }
                            )
                        }
                    );
                }
            }
        );
    });

    router.get('/me', (req, res) => {
        const token = req.cookies.tigerToken;
        if (!token) return res.status(401).json({ error: 'Not authenticated' });
        try {
            const decoded = jwt.verify(token, secret);
            db.query(
                'SELECT * FROM tbl_studentaccounts WHERE studentAccount_ID = ?',
                [decoded.id],
                (err, results) => {
                    if (err) return res.status(500).json({ error: err.message });
                    if (results.length > 0) {
                        res.json({ user: results[0] });
                    } else {
                        res.status(404).json({ error: 'User not found' });
                    }
                }
            )
        } catch (err) {
            res.status(401).json({ error: 'Invalid token' });
        }
    })



    router.post('/logout', (req, res) => {
        res.clearCookie('tigerToken', {
            httpOnly: true,
            secure: false, //match cookie settings
            sameSite: 'lax'
        });
        res.json({ success: true });
    })




    //Admin Stuffs Here:
    router.post('/staff-login', (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required'});
        }
        db.query(
            'SELECT sa.*, sr.role FROM tbl_staffaccounts sa  LEFT JOIN tbl_staffroles sr ON sa.staffRole_ID = sr.staffRole_ID WHERE sa.email = ? AND sa.password = ?',
            [email, password],
            (err, results) => {
                if (err) return res.status(500).json({ error: err.message});
                if (results.length > 0) {
                    // User Found
                    res.json({ success: true, user: results[0]});
                } else {
                    //No Match
                    res.json({ success: false, error: 'Invalid email or password '});
                }
            }
        )
    })

    return router;
};

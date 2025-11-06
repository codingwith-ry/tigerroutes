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
        <div style="font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 24px;">
          <div style="max-width: 500px; background: white; margin: auto; padding: 32px; border-radius: 12px; text-align: center;">
          <img src="/images/02_TigerRoutes_Logo.png" alt="TigerRoutes Logo" style="width: 100px; margin-bottom: 16px;" />
            <h2 style="font-size: 24px; color: #111827;">Reset Your Password</h2>
            <div style="text-align: left;">
            <p style="color: #374151;">Hello, <br /><br /> Use the following One-Time Password (OTP) to verify your identity. This code is valid for the next 5 minutes:</p>
            </div>
            <p style="font-size: 36px; font-weight: bold; letter-spacing: 4px; color: #ea9d2d;">${code}</p>
            <a href="http://localhost:3000/otp?email=${encodeURIComponent(email)}&code=${code}"
              style="display:inline-block;background:#ea9d2d;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:5px;margin-bottom:8px;font-weight:bold;transition:background-color 0.3s;">
              Reset Password
            </a>
            <p style="color: #6b7280;">If you did not request this code, please ignore this message or contact support.</p>
            <hr style="border:none;border-top:1px solid #f3f4f6;margin:32px 0;" />
            <p style="font-size: 12px; color: #9ca3af;">&copy; 2025 TigerRoutes. All rights reserved.</p>
          </div>
        </div>
      `,
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
                    const staffUser = results[0];
                    // Log staff login
                    try {
                        const actionText = `Staff login: ${staffUser.email} (ID:${staffUser.staffAccount_ID})`;
                        db.promise().query('INSERT INTO tbl_stafflogs (staffAccount_ID, action, date) VALUES (?, ?, UTC_TIMESTAMP())', [staffUser.staffAccount_ID || null, actionText]).catch(() => {});
                    } catch (e) {
                        // ignore logging failures
                    }

                    res.json({ success: true, user: staffUser});
                } else {
                    //No Match
                    res.json({ success: false, error: 'Invalid email or password '});
                }
            }
        )
    })

    return router;
};

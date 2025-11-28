//This file is where we keep all login/register API routes
const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const secret = 'greenP1ace'
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;
const path = require('path');
const { decrypt } = require('./utils/encryption');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

module.exports = (db) => {
    const router = express.Router();
    const client = new OAuth2Client();
    const resetCodes = {};

    // Register endpoint - hash password before saving
    router.post('/register', async (req, res) => {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({error: 'Please fill in all fields'});
        }

        try {
            const hashed = await bcrypt.hash(password, SALT_ROUNDS);
            db.query(
                'INSERT into tbl_studentaccounts (name, email, password) VALUES (?, ?, ?)',
                [name, email, hashed],
                (err, result) => {
                    if (err) return res.status(500).json({error: err.message});
                    res.json({success:true, id: result.insertId});
                }
            );
        } catch (err) {
            console.error('[register] bcrypt error', err);
            return res.status(500).json({ error: 'Failed to create account' });
        }
    });

    // Login Endpoint - verify hashed password
    router.post('/login', (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required'});
        }
        db.query(
            'SELECT * FROM tbl_studentaccounts WHERE email = ?',
            [email],
            async (err, results) => {
                if (err) return res.status(500).json({ error: err.message});
                if (results.length > 0) {
                    const user = results[0];
                    try {
                        let match = false;
                        try {
                            match = await bcrypt.compare(password, user.password || '');
                        } catch (e) {
                            match = false;
                        }

                        // Migration: if stored password is plaintext and matches, re-hash it
                        if (!match && user.password === password) {
                            try {
                                const newHash = await bcrypt.hash(password, SALT_ROUNDS);
                                await db.promise().query('UPDATE tbl_studentaccounts SET password = ? WHERE studentAccount_ID = ?', [newHash, user.studentAccount_ID]);
                                match = true;
                                user.password = newHash;
                            } catch (e) {
                                console.error('[login] failed to migrate plaintext password to hash', e);
                            }
                        }

                        if (!match) return res.json({ success: false, error: 'Invalid email or password' });

                        const token = jwt.sign(
                            { id: user.studentAccount_ID, email: user.email, name: user.name },
                            secret,
                            { expiresIn: '1h' }
                        );

                        const cookieMaxAge = req.body && req.body.rememberMe
                            ? 30 * 24 * 60 * 60 * 1000 // 30 days
                            : 1 * 60 * 60 * 1000; // 1 hour (match jwt expiry)

                        res.cookie('tigerToken', token, {
                            httpOnly: true,
                            secure: false,
                            sameSite: 'lax',
                            maxAge: cookieMaxAge
                        });
                        res.json({ success: true, user });
                    } catch (bcryptErr) {
                        console.error('[login] bcrypt compare error', bcryptErr);
                        return res.status(500).json({ error: 'Authentication error' });
                    }
                } else {
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
                user: 'tigerroutes.contact@gmail.com', //change this email
                pass: 'epki kwhr jdff egaj'//put password here
            }
        });

        const mailOptions = {
            from: 'tigerroutes.contact@gmail.com',
            to: email,
            subject: 'TigerRoutes Password Reset',
            html: `
        <div style="font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 24px;">
          <div style="max-width: 500px; background: white; margin: auto; padding: 32px; border-radius: 12px; text-align: center;">
            <img src="cid:tiger_logo" alt="TigerRoutes Logo" style="width: 150px; margin-bottom: 12px;" />
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
            attachments: [
              {
                filename: '04_TigerRoutes_Logo.png',
                path: path.join(__dirname, '..', 'public', 'images', '02_TigerRoutes_Logo.png'),
                cid: 'tiger_logo' // matches src="cid:tiger_logo"
              }
            ]
        };

        try {
            await transporter.sendMail(mailOptions);
            res.json({ success: true });
        } catch (err) {
            // Log the full error server-side for debugging
            console.error('[forgot-password] sendMail error:', err && err.stack ? err.stack : err);

            // In development return the underlying error message to help debug; in production keep it generic
            const isDev = process.env.NODE_ENV !== 'production';
            if (isDev) {
                return res.status(500).json({ error: 'Failed to send email.', detail: err && err.message ? err.message : String(err) });
            }

            return res.status(500).json({ error: 'Failed to send email.' });
        }
    });

    // Staff forgot password -> notify admin email for manual reset
    router.post('/staff-forgot-password', async (req, res) => {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        try {
            // Check staff account exists
            const [rows] = await db.promise().query('SELECT * FROM tbl_staffaccounts WHERE email = ?', [email]);
            if (!rows || rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Staff account not found' });
            }

            const staff = rows[0];

            // Admin notify email (can be configured via ENV)
            const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || 'dominicadino23@gmail.com';

            // Nodemailer transporter (reuse existing configuration)
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'tigerroutes.contact@gmail.com', // change as needed
                    pass: 'epki kwhr jdff egaj'
                }
            });

            const mailOptions = {
                from: 'tigerroutes.contact@gmail.com',
                to: ADMIN_NOTIFY_EMAIL,
                subject: 'Staff Password Change Request',
                html: `
                    <p>Dear Admin,</p>
                    <p>The following staff account has requested a password change:</p>
                    <ul>
                      <li><strong>Email:</strong> ${staff.email}</li>
                      <li><strong>Name:</strong> ${staff.name || ''}</li>
                      <li><strong>Staff ID:</strong> ${staff.staffAccount_ID || ''}</li>
                    </ul>
                    <p>Please follow your internal procedures to reset the account password.</p>
                    <p>Timestamp: ${new Date().toISOString()}</p>
                `
            };

            await transporter.sendMail(mailOptions);
            return res.json({ success: true, message: 'Request sent to admin' });
        } catch (err) {
            console.error('[staff-forgot-password] error:', err);
            return res.status(500).json({ success: false, message: 'Failed to notify admin' });
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

    //resetting the password itself - use bcrypt to hash passwords
    router.post('/reset-password', async (req,res) => {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and new password required'});
        }

        try {
            const [selRows] = await db.promise().query('SELECT password FROM tbl_studentaccounts WHERE email = ? LIMIT 1', [email]);
            if (!selRows || selRows.length === 0) return res.status(404).json({ error: 'Account not found.' });

            const currentHash = selRows[0].password || '';
            const isSame = await bcrypt.compare(password, currentHash);
            if (isSame) {
                return res.status(400).json({ error: 'New password must be different from the previous password.' });
            }

            const newHash = await bcrypt.hash(password, SALT_ROUNDS);
            const [result] = await db.promise().query('UPDATE tbl_studentaccounts SET password = ? WHERE email = ?', [newHash, email]);
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Account not found.'});
            return res.json({ success: true });
        } catch (err) {
            console.error('[reset-password] error', err);
            return res.status(500).json({ error: 'Failed to reset password' });
        }
    });

    //token verification using Google API
    async function verify(token) {
        const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID, //Client ID
            });
            const payload = ticket.getPayload();
            return payload;
    }

    // Authentication with Google (accepts either idToken or email+name)
    router.post('/google-auth', async (req, res) => {
        let { idToken, email, name } = req.body;

        // If client supplied an ID token, verify it and extract email/name
        if (idToken) {
            let payload;
            try {
                payload = await verify(idToken);
            } catch (err) {
                console.error('[google-auth] token verification failed:', err && err.message ? err.message : err);
                return res.status(401).json({ error: 'Invalid Google token' });
            }

            if (!payload || !payload.email) return res.status(400).json({ error: 'Google token did not contain email' });
            if (!payload.email_verified) return res.status(403).json({ error: 'Google email not verified' });

            email = payload.email;
            name = payload.name || '';
        }

        if (!email || !name) {
            return res.status(400).json({ error: 'Missing email or name' });
        }

        db.query(
            'SELECT * FROM tbl_studentaccounts WHERE email = ?',
            [email],
            (err, results) => {
                if (err) return res.status(500).json({ error: err.message });
                if (results.length > 0) {
                    // create JWT and set cookie for Google-authenticated user
                    try {
                        const user = results[0];
                        const token = jwt.sign({ id: user.studentAccount_ID, email: user.email, name: user.name }, secret, { expiresIn: '1h' });
                        res.cookie('tigerToken', token, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 1 * 60 * 60 * 1000 });
                        return res.json({ success: true, isNew: false, user });
                    } catch (e) {
                        return res.json({ success: true, isNew: false, user: results[0] });
                    }
                } else {
                    db.query(
                        'INSERT INTO tbl_studentaccounts (name, email, password) VALUES (?, ?, ?)',
                        [name, email, ''],
                        (err2) => {
                            if (err2) return res.status(500).json({ error: err2.message });

                            db.query(
                                'SELECT * FROM tbl_studentaccounts WHERE email = ?',
                                [email],
                                (err3, newResults) => {
                                    if (err3) return res.status(500).json({ error: err3.message });
                                    try {
                                        const user = newResults[0];
                                        const token = jwt.sign({ id: user.studentAccount_ID, email: user.email, name: user.name }, secret, { expiresIn: '1h' });
                                        res.cookie('tigerToken', token, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 1 * 60 * 60 * 1000 });
                                        return res.json({ success: true, isNew: true, user });
                                    } catch (e) {
                                        return res.json({ success: true, isNew: true, user: newResults[0]});
                                    }
                                }
                            )
                        }
                    );
                }
            }
        );
    });

    router.get('/me', (req, res) => {
        const token = req.cookies && req.cookies.tigerToken;
        if (!token) return res.status(401).json({ success: false, message: 'Not authenticated' });
        try {
            const decoded = jwt.verify(token, secret);
            db.query(
                'SELECT * FROM tbl_studentaccounts WHERE studentAccount_ID = ?',
                [decoded.id],
                (err, results) => {
                    if (err) return res.status(500).json({ success: false, message: err.message });
                    if (results.length > 0) {
                        return res.json({ success: true, user: results[0] });
                    }
                    return res.status(404).json({ success: false, message: 'User not found' });
                }
            )
        } catch (err) {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }
    });



    router.post('/logout', (req, res) => {
        // Destroy server-side session if present
        try {
            if (req.session) {
                req.session.destroy((err) => {
                    if (err) console.error('Error destroying session on logout:', err);
                    // Clear cookies related to authentication
                    res.clearCookie('tigerToken', { httpOnly: true, secure: false, sameSite: 'lax' });
                    const sessionCookieName = process.env.SESSION_COOKIE_NAME || 'tigerroutes.sid';
                    res.clearCookie(sessionCookieName, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
                    return res.json({ success: true });
                });
                return;
            }
        } catch (err) {
            console.error('Logout error when destroying session:', err);
        }
        // Fallback: clear cookies even if no session object
        res.clearCookie('tigerToken', { httpOnly: true, secure: false, sameSite: 'lax' });
        const sessionCookieName = process.env.SESSION_COOKIE_NAME || 'tigerroutes.sid';
        res.clearCookie(sessionCookieName, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
        res.json({ success: true });
    })




    //Admin Stuffs Here:
    router.post('/staff-login', (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required'});
        }
        db.query(
            'SELECT sa.*, sr.role FROM tbl_staffaccounts sa  LEFT JOIN tbl_staffroles sr ON sa.staffRole_ID = sr.staffRole_ID WHERE sa.email = ?',
            [email],
            async (err, results) => {
                if (err) return res.status(500).json({ error: err.message});
                if (results.length > 0) {
                    const staffUser = results[0];
                    try {
                        let match = false;
                        const stored = staffUser.password || '';
                        // If this is a counselor (staffRole_ID == 1) we store reversible encrypted passwords in `password`.
                        // AES-256-GCM-encrypted passwords stored. Any counselor rows with bcrypt should be removed or
                        // re-provisioned by the admin.
                        if (staffUser.staffRole_ID === 1) {
                            try {
                                try {
                                    // Treat stored value as encrypted ciphertext (base64), decrypt and compare plaintext
                                    const decrypted = decrypt(stored);
                                    match = decrypted === password;
                                } catch (dErr) {
                                    console.error('[staff-login] failed to decrypt counselor password', dErr);
                                    match = false;
                                }
                            } catch (e) {
                                console.error('[staff-login] counselor compare error', e);
                                match = false;
                            }
                        } else {
                            try {
                                match = await bcrypt.compare(password, stored);
                            } catch (e) {
                                match = false;
                            }
                            // Migration: handle legacy plaintext password for non-counselor staff (including admins)
                            // If the stored value is not a bcrypt hash and the provided password matches the stored plaintext,
                            // hash it and update the DB so future logins use bcrypt.
                            try {
                                const storedRaw = staffUser.password || '';
                                const looksLikeBcrypt = storedRaw.startsWith('$2');
                                if (!match && storedRaw && !looksLikeBcrypt) {
                                    // Compare plaintext equality as a fallback migration check
                                    if (storedRaw === password) {
                                        try {
                                            const newHash = await bcrypt.hash(password, SALT_ROUNDS);
                                            await db.promise().query('UPDATE tbl_staffaccounts SET password = ? WHERE staffAccount_ID = ?', [newHash, staffUser.staffAccount_ID]);
                                            match = true;
                                            staffUser.password = newHash;
                                        } catch (e) {
                                            console.error('[staff-login] failed to migrate plaintext password to hash', e);
                                        }
                                    }
                                }
                            } catch (e) {
                                console.error('[staff-login] migration check error', e);
                            }
                        }
                        if (!match) return res.json({ success: false, error: 'Invalid email or password' });

                        // Log staff login (non-blocking)
                        try {
                            const actionText = `Staff login: ${staffUser.email} (ID:${staffUser.staffAccount_ID})`;
                            db.promise().query('INSERT INTO tbl_stafflogs (staffAccount_ID, action, date) VALUES (?, ?, UTC_TIMESTAMP())', [staffUser.staffAccount_ID || null, actionText]).catch(() => {});
                        } catch (e) {
                            console.warn('[staff-login] non-blocking log error', e);
                        }

                        const tokenPayload = {
                            id: staffUser.staffAccount_ID,
                            email: staffUser.email,
                            name: staffUser.name || staffUser.staffName || '',
                            staffRole_ID: staffUser.staffRole_ID
                        };
                        const token = jwt.sign(tokenPayload, secret, { expiresIn: '8h' });
                        const cookieMaxAge = 8 * 60 * 60 * 1000; // 8 hours
                        res.cookie('tigerToken', token, {
                            httpOnly: true,
                            secure: false,
                            sameSite: 'lax',
                            maxAge: cookieMaxAge
                        });
                        return res.json({ success: true, user: staffUser });
                    } catch (bcryptErr) {
                        console.error('[staff-login] bcrypt error', bcryptErr);
                        return res.status(500).json({ error: 'Authentication error' });
                    }
                } else {
                    res.json({ success: false, error: 'Invalid email or password '});
                }
            }
        )
    })

                // Return current staff profile from JWT (tigerToken) set as HttpOnly cookie
                router.get('/staff/me', (req, res) => {
                        try {
                            // verifyJwtCookie middleware attaches decoded token to req.user when present
                            if (req.user && req.user.id) {
                                // fetch fresh staff record from DB
                                db.query('SELECT * FROM tbl_staffaccounts WHERE staffAccount_ID = ?', [req.user.id], (err, results) => {
                                    if (err) return res.status(500).json({ success: false, message: err.message });
                                    if (results && results.length > 0) {
                                        // include minimal fields consistent with previous session shape
                                        const s = results[0];
                                        const staffProfile = {
                                            staffAccount_ID: s.staffAccount_ID,
                                            staffRole_ID: s.staffRole_ID,
                                            staffEmail: s.email,
                                            staffName: s.name || s.staffName || ''
                                        };
                                        return res.json({ success: true, data: staffProfile });
                                    }
                                    return res.status(404).json({ success: false, message: 'Staff user not found' });
                                });
                                return;
                            }
                        } catch (e) {
                            console.warn('[staff/me] error', e);
                        }
                        return res.status(401).json({ success:false, message: 'Not authenticated' });
                });

    return router;
};

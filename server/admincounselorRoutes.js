const express = require('express');
const requireJwt = require('./middleware/requireJwt');
const nodemailer = require('nodemailer');
const path = require('path');
const { encrypt, decrypt } = require('./utils/encryption');
// bcrypt wrapper: prefer native bcrypt, fall back to bcryptjs
let bcryptLib = null;
try {
    bcryptLib = require('bcrypt');
} catch (e) {
    try { bcryptLib = require('bcryptjs'); } catch (e2) { bcryptLib = null; }
}
const SALT_ROUNDS = 10;
const bcrypt = {
    hash: (password, rounds) => new Promise((resolve, reject) => {
        if (!bcryptLib) return reject(new Error('bcrypt not installed'));
        bcryptLib.hash(password, rounds || SALT_ROUNDS, (err, hash) => err ? reject(err) : resolve(hash));
    }),
    compare: (password, hash) => new Promise((resolve, reject) => {
        if (!bcryptLib) return reject(new Error('bcrypt not installed'));
        bcryptLib.compare(password, hash, (err, res) => err ? reject(err) : resolve(res));
    })
};

module.exports = (db) => {

    const router = express.Router();
    // All admin counselor routes require a valid JWT (tigerToken)
    router.use(requireJwt);

    // POST: Add a new counselor.
    router.post('/counselor/add', async (req, res) => {
        const { name, email, strand, status, officeLocation, consultationHours, about, adminStaffAccountId } = req.body;

        // Validation
        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: 'Name and email are required'
            });
        }

        try {
            let staffProfileId = null;

            if (strand || officeLocation || consultationHours || about) {
                //Map strand name to strand_ID
                const strandQuery = 'SELECT strand_ID FROM tbl_strands WHERE strandName = ?';
                const [strandResult] = await db.promise().query(strandQuery, [strand]);
                const strandId = strandResult.length > 0 ? strandResult[0].strand_ID : null;
                // Map officeLocation -> officeDetails and consultationHours -> consultationDetails
                const officeDetails = officeLocation || null;
                const consultationDetails = consultationHours || null;

                const profileQuery = `
                    INSERT INTO tbl_staffprofiles (strand_ID, officeDetails, about, consultationDetails)
                    VALUES (?, ?, ?, ?)`;

                const [profileResult] = await db.promise().query(profileQuery, [
                    strandId,
                    officeDetails,
                    about,
                    consultationDetails
                ]);
                staffProfileId = profileResult.insertId;
            }

            // Create staff account
            // Generate a random 8-character password (letters, numbers, special chars)
            const generatePassword = () => {
                const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
                const numbers = '0123456789';
                const specials = '!@#$%^&*()-_=+[]{};:<>?,.';
                const all = letters + numbers + specials;
                const desiredLength = 8;
                let pw = '';
                // ensure at least one letter, one number and one special
                pw += letters[Math.floor(Math.random() * letters.length)];
                pw += numbers[Math.floor(Math.random() * numbers.length)];
                pw += specials[Math.floor(Math.random() * specials.length)];
                for (let i = 3; i < desiredLength; i++) pw += all[Math.floor(Math.random() * all.length)];
                // shuffle
                pw = pw.split('').sort(() => 0.5 - Math.random()).join('');
                return pw;
            };
            const generatedPassword = generatePassword();

            // staffRole_ID = 1 is for counselor
            const accountQuery = `
                INSERT INTO tbl_staffaccounts (name, email, password, staffRole_ID, staffProfile_ID, status)
                VALUES (?, ?, ?, ?, ?, ?)`;
            const statusValue = status === 'Active' ? 1 : 0;

            // Store reversible encrypted password directly in the `password` column for counselors
            let encryptedPassword = null;
            try {
                encryptedPassword = encrypt(generatedPassword);
            } catch (e) {
                console.warn('Encryption unavailable for counselor password:', e && e.message ? e.message : e);
            }

            // If encryption failed, abort creation to avoid inserting NULL passwords
            if (!encryptedPassword) {
                return res.status(500).json({ success: false, message: 'Server is not configured to encrypt counselor passwords. Set PASSWORD_REVEAL_KEY and restart the server.' });
            }
            const [accountResult] = await db.promise().query(accountQuery, [
                name,
                email,
                encryptedPassword, // store decryptable password here (not bcrypt)
                1,
                staffProfileId,
                statusValue
            ]);

            // Log the create action to tbl_stafflogs (use Philippines time)
            try {
                const actionText = `Create counselor ${name} (id:${accountResult.insertId})`;
                // Store UTC timestamp in DB; clients should render to local time as needed
                await db.promise().query('INSERT INTO tbl_stafflogs (staffAccount_ID, action, date) VALUES (?, ?, UTC_TIMESTAMP())', [adminStaffAccountId || null, actionText]);
            } catch (logErr) {
                console.warn('Failed to write staff log for create counselor:', logErr);
            }

            // Send account details email to the new counselor using the project's mailer
            let mailSent = false;
            let mailError = null;
            try {
                    const transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                    user: 'tigerroutes.contact@gmail.com',
                                    pass: 'epki kwhr jdff egaj'
                            }
                    });

                    const mailOptions = {
                            from: 'tigerroutes.contact@gmail.com',
                            to: email,
                            subject: 'TigerRoutes — Your Counselor Account Details',
                            text: `Hello ${name},\n\nYour TigerRoutes counselor account has been created.\nEmail: ${email}\nPassword: ${generatedPassword}\n\nLog in: http://localhost:3000/admin\n\nPlease change your password after first login.`,
                            html: `
                                <div style="font-family: Inter, Arial, sans-serif; background:#f3f4f6; padding:24px;">
                                    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 24px rgba(17,24,39,0.06);">
                                        <div style="padding:28px 32px;text-align:center;background:linear-gradient(90deg,#fffaf0,#fffdf7);">
                                            <img src="cid:tiger_logo" alt="TigerRoutes" style="width:120px;height:auto;display:block;margin:0 auto 12px;" />
                                            <h1 style="margin:0;font-size:20px;color:#111827;font-weight:600;">Counselor Account Details</h1>
                                            <p style="margin:8px 0 0;color:#6b7280;font-size:13px;">Welcome to TigerRoutes — please keep this information secure.</p>
                                        </div>
                                        <div style="padding:20px 32px 28px;color:#374151;font-size:14px;line-height:1.5;">
                                            <p style="margin:0 0 12px;">Hello <strong>${name}</strong>,</p>
                                            <p style="margin:0 0 16px;">Your counselor account has been created. Use the credentials below to sign in. For security, change your password after logging in.</p>

                                            <table role="presentation" style="width:100%;margin:8px 0 18px;border-collapse:collapse;">
                                                <tr>
                                                    <td style="padding:8px 12px;background:#f9fafb;border-radius:8px 0 0 8px;width:120px;font-weight:600;color:#111827;">Email</td>
                                                    <td style="padding:8px 12px;background:#f9fafb;border-radius:0 8px 8px 0;color:#111827;">${email}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding:8px 12px;border-radius:8px 0 0 8px;font-weight:600;color:#111827;">Password</td>
                                                    <td style="padding:8px 12px;border-radius:0 8px 8px 0;color:#111827;"><code style="background:#fff2d7;padding:4px 8px;border-radius:6px;color:#7c2d12;font-weight:700;">${generatedPassword}</code></td>
                                                </tr>
                                            </table>

                                            <div style="text-align:center;margin-top:8px;">
                                                <a href="http://localhost:3000/admin" target="_blank" rel="noopener" style="display:inline-block;padding:12px 20px;border-radius:8px;background:#F6BE1E;color:#111827;font-weight:700;text-decoration:none;box-shadow:0 6px 18px rgba(246,190,30,0.18);">
                                                    Go to Admin Login
                                                </a>
                                            </div>

                                            <p style="margin:16px 0 0;color:#6b7280;font-size:12px;">If you did not request this account or believe this is an error, contact your administrator immediately.</p>
                                        </div>
                                        <div style="padding:12px 20px;background:#fafafa;border-top:1px solid #f3f4f6;text-align:center;color:#9ca3af;font-size:12px;">
                                            &copy; 2025 TigerRoutes. All rights reserved.
                                        </div>
                                    </div>
                                </div>
                            `,
                            attachments: [
                                {
                                    filename: '04_TigerRoutes_Logo.png',
                                    path: path.join(__dirname, '..', 'public', 'images', '02_TigerRoutes_Logo.png'),
                                    cid: 'tiger_logo'
                                }
                            ]
                    };

                    await transporter.sendMail(mailOptions);
                    mailSent = true;
            } catch (mailErr) {
                    console.error('Failed to send counselor account email:', mailErr && mailErr.stack ? mailErr.stack : mailErr);
                    mailError = mailErr && mailErr.message ? mailErr.message : String(mailErr);
            }

            // Return created response; include mail status for visibility
                const responsePayload = {
                    success: true,
                    message: 'Counselor added successfully',
                    data: {
                            staffAccount_ID: accountResult.insertId,
                            staffProfile_ID: staffProfileId,
                            name,
                            email,
                        // include plaintext generated password so admin can communicate it to counselor
                        password: generatedPassword
                    }
            };
            if (!mailSent) {
                    responsePayload.mailWarning = 'Failed to send account email to counselor';
                    responsePayload.mailError = mailError;
            }

            res.status(201).json(responsePayload);
        } catch (error) {
            console.error('Error adding counselor:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to add counselor',
                error: error.message
            });
        }
    });

    //GET: Fetch all counselors
    router.get('/counselors', async (req, res) => {
        try {
            const query = `
                SELECT
                    sa.staffAccount_ID,
                    sa.name,
                    sa.email,
                    sa.status,
                    sr.role,
                    sp.officeDetails,
                    sp.consultationDetails,
                    sp.about,
                    s.strandName as strand,
                    (
                      SELECT DATE_FORMAT(MAX(sl.date), '%Y-%m-%d %H:%i:%s')
                      FROM tbl_stafflogs sl
                      WHERE sl.staffAccount_ID = sa.staffAccount_ID
                        AND sl.action LIKE 'Staff login:%'
                    ) AS lastLogin
                FROM tbl_staffaccounts sa
                LEFT JOIN tbl_staffroles sr ON sa.staffRole_ID = sr.staffRole_ID
                LEFT JOIN tbl_staffprofiles sp ON sa.staffProfile_ID = sp.staffProfile_ID
                LEFT JOIN tbl_strands s ON sp.strand_ID = s.strand_ID
                WHERE sa.staffRole_ID = 1
                ORDER BY sa.name`;
            const [counselors] = await db.promise().query(query);

            res.json({
                success: true,
                data: counselors
            });
        } catch (error) {
            console.error('Error fetching counselors:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch counselors',
                error: error.message
            });
        }
    });

    //GET Fetch single counselor by full name (query param: ?name=Full%20Name)
    router.get('/counselor/by-name', async (req, res) => {
        try {
            const name = req.query.name;
            if (!name) return res.status(400).json({ success: false, message: 'name query is required'});

            const query = `
                SELECT
                    sa.staffAccount_ID,
                    sa.name,
                    sa.email,
                    sa.status,
                    sr.role,
                    sp.officeDetails,
                    sp.consultationDetails,
                    sp.about,
                    s.strandName as strand
                FROM tbl_staffaccounts sa
                LEFT JOIN tbl_staffroles sr ON sa.staffRole_ID = sr.staffRole_ID
                LEFT JOIN tbl_staffprofiles sp ON sa.staffProfile_ID = sp.staffProfile_ID
                LEFT JOIN tbl_strands s ON sp.strand_ID = s.strand_ID
                WHERE sa.name = ?
                LIMIT 1
                `;
            const [rows] = await db.promise().query(query, [name]);

            if (!rows || rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Counselor not found' });

            }

            return res.json({ success: true, data: rows[0] });
        } catch (error) {
            console.error('Error fetching counselor by name:', error);
            res.status(500).json({ success: false, message: 'Server error', error: error.message });
        }
    });

    router.get('/counselor/:id', async (req, res) => {
        try {
            const id = req.params.id;
            if (!id) return res.status(400).json({ success: false, message: 'id required' });

            const query = `
                SELECT
                    sa.staffAccount_ID,
                    sa.name,
                    sa.email,
                    sa.status,
                    sr.role,
                    sp.officeDetails,
                    sp.consultationDetails,
                    sp.about,
                    s.strandName as strand
                FROM tbl_staffaccounts sa
                LEFT JOIN tbl_staffroles sr ON sa.staffRole_ID = sr.staffRole_ID
                LEFT JOIN tbl_staffprofiles sp ON sa.staffProfile_ID = sp.staffProfile_ID
                LEFT JOIN tbl_strands s ON sp.strand_ID = s.strand_ID
                WHERE sa.staffAccount_ID = ?
                LIMIT 1`;

            const [rows] = await db.promise().query(query, [id]);
            if (!rows || rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Counselor not found' });
            }
            res.json({ success: true, data: rows[0] });
        } catch (error) {
            console.error('Error fetching counselor by id:', error);
            res.status(500).json({ success: false, message: 'Server error', error: error.message });
        }
    });

        // GET: Fetch all counselor notes for a specific counselor (staffAccount_ID)
        router.get('/counselor/:id/notes', async (req, res) => {
            try {
                const id = req.params.id;
                if (!id) return res.status(400).json({ success: false, message: 'id required' });

                const query = `
                    SELECT
                        cn.counselorNote_ID,
                        cn.studentAssessment_ID,
                        cn.counselorNotes,
                        cn.date,
                        sa.studentAccount_ID AS studentAccountId,
                        st.name AS studentName
                    FROM tbl_counselornotes cn
                    LEFT JOIN tbl_studentassessments sa ON cn.studentAssessment_ID = sa.studentAssessment_ID
                    LEFT JOIN tbl_studentaccounts st ON sa.studentAccount_ID = st.studentAccount_ID
                    WHERE cn.staffAccount_ID = ?
                    ORDER BY cn.date DESC
                `;

                const [rows] = await db.promise().query(query, [id]);
                return res.json({ success: true, data: rows || [] });
            } catch (error) {
                console.error('Error fetching counselor notes by counselor id:', error);
                res.status(500).json({ success: false, message: 'Server error', error: error.message });
            }
        });

    router.put('/counselor/:id', async (req, res) => {
        const id = req.params.id;
        const { name, email, strand, status, officeLocation, consultationHours, about, adminStaffAccountId } = req.body;
        // db in this project is a Connection (created via mysql.createConnection).
        // The promise() wrapper on a Connection exposes beginTransaction/commit/rollback and query.
        let conn;
        try {
            conn = await db.promise().getConnection();
            await conn.beginTransaction();

            // Fetch existing values so we can generate a detailed change summary
            const [existingRows] = await conn.query(`
                SELECT
                    sa.name AS name,
                    sa.email AS email,
                    sa.status AS status,
                    sp.officeDetails AS officeDetails,
                    sp.consultationDetails AS consultationDetails,
                    sp.about AS about,
                    s.strandName AS strand
                FROM tbl_staffaccounts sa
                LEFT JOIN tbl_staffprofiles sp ON sa.staffProfile_ID = sp.staffProfile_ID
                LEFT JOIN tbl_strands s ON sp.strand_ID = s.strand_ID
                WHERE sa.staffAccount_ID = ?
                LIMIT 1
            `, [id]);
            const existing = existingRows && existingRows[0] ? existingRows[0] : {};

            // find profile id
            const [acctRows] = await conn.query('SELECT staffProfile_ID FROM tbl_staffaccounts WHERE staffAccount_ID = ?', [id]);
            const staffProfileId = acctRows && acctRows[0] ? acctRows[0].staffProfile_ID : null;
            // map strand -> strand_ID
            const [strandRows] = await conn.query('SELECT strand_ID FROM tbl_strands WHERE strandName = ?', [strand]);
            const strandId = strandRows && strandRows.length ? strandRows[0].strand_ID : null;
            if (staffProfileId) {
                await conn.query(
                    'UPDATE tbl_staffprofiles SET strand_ID=?, officeDetails=?, consultationDetails=?, about=? WHERE staffProfile_ID=?',
                    [strandId, officeLocation, consultationHours, about, staffProfileId]
                );
            } else {
                const [r] = await conn.query(
                    'INSERT INTO tbl_staffprofiles (strand_ID, officeDetails, consultationDetails, about) VALUES (?, ?, ?, ?)',
                    [strandId, officeLocation, consultationHours, about]
                );
                await conn.query('UPDATE tbl_staffaccounts SET staffProfile_ID = ? WHERE staffAccount_ID = ?', [r.insertId, id]);
            }
            // update account
            await conn.query('UPDATE tbl_staffaccounts SET name=?, email=?, status=? WHERE staffAccount_ID=?', [name, email, status === 'Active' ? 1 : 0, id]);
            await conn.commit();

            // Build a changes list comparing existing -> new
            try {
                const changes = [];
                const oldName = existing.name || '';
                const oldEmail = existing.email || '';
                const oldStatus = (existing.status === 1 || existing.status === '1' || existing.status === 'Active') ? 'Active' : 'Inactive';
                const oldStrand = existing.strand || '';
                const oldOffice = existing.officeDetails || '';
                const oldConsult = existing.consultationDetails || '';
                const oldAbout = existing.about || '';

                if ((oldName || '') !== (name || '')) changes.push(`name: "${oldName}" -> "${name}"`);
                if ((oldEmail || '') !== (email || '')) changes.push(`email: "${oldEmail}" -> "${email}"`);
                if ((oldStatus || '') !== (status || '')) changes.push(`status: "${oldStatus}" -> "${status}"`);
                if ((oldStrand || '') !== (strand || '')) changes.push(`strand: "${oldStrand}" -> "${strand}"`);
                if ((oldOffice || '') !== (officeLocation || '')) changes.push(`officeLocation: "${oldOffice}" -> "${officeLocation}"`);
                if ((oldConsult || '') !== (consultationHours || '')) changes.push(`consultationHours: "${oldConsult}" -> "${consultationHours}"`);
                if ((oldAbout || '') !== (about || '')) changes.push(`about: "${oldAbout}" -> "${about}"`);

                const changeSummary = changes.length ? changes.join('; ') : 'no changes';
                const actionText = `Edit counselor ${name} (id:${id}) -- ${changeSummary}`;
                // Store UTC timestamp in DB
                await db.promise().query('INSERT INTO tbl_stafflogs (staffAccount_ID, action, date) VALUES (?, ?, UTC_TIMESTAMP())', [adminStaffAccountId || null, actionText]);
            } catch (logErr) {
                console.warn('Failed to write staff log for edit counselor:', logErr);
            }
            res.json({ success: true, message: 'Updated' });
        } catch (err) {
            try { if (conn) await conn.rollback(); } catch (e) { console.error('Rollback error', e); }
            console.error(err);
            res.status(500).json({ success:false, message: 'DB error', error: err.message});
        } finally {
            try { if (conn) conn.release(); } catch (e) { /* ignore release errors */ }
        }
    });

    router.post('/counselor/delete', async (req, res) => {
        let conn;
        try {
            const { id } = req.body;
            if (!id) return res.status(400).json({ success: false, message: 'Missing counselor id' });

            conn = await db.promise().getConnection();

            // Use authenticated admin from JWT if available (requireJwt middleware ensures req.user exists)
            const adminUser = req.user && (req.user.staffAccount_ID || req.user.id) ? (req.user.staffAccount_ID || req.user.id) : null;

            // Perform delete within a transaction
            await conn.beginTransaction();

            // Get the profile id (if any) and name of the counselor to delete
            const [acctRows] = await conn.query('SELECT staffProfile_ID, name FROM tbl_staffaccounts WHERE staffAccount_ID = ?', [id]);
            const staffProfileId = acctRows && acctRows[0] ? acctRows[0].staffProfile_ID : null;
            const counselorName = acctRows && acctRows[0] ? acctRows[0].name : null;

            // Delete the staff account
            await conn.query('DELETE FROM tbl_staffaccounts WHERE staffAccount_ID = ?', [id]);

            // Optionally delete the profile row if it exists
            if (staffProfileId) {
                await conn.query('DELETE FROM tbl_staffprofiles WHERE staffProfile_ID = ?', [staffProfileId]);
            }

            await conn.commit();

            // Log the delete action to tbl_stafflogs (use adminUser from JWT if available)
            try {
                const adminId = adminUser || null;
                const actionText = counselorName ? `Delete counselor ${counselorName} (id:${id})` : `Delete counselor (id:${id})`;
                await db.promise().query('INSERT INTO tbl_stafflogs (staffAccount_ID, action, date) VALUES (?, ?, UTC_TIMESTAMP())', [adminId, actionText]);
            } catch (logErr) {
                console.warn('Failed to write staff log for delete counselor:', logErr);
            }

            return res.json({ success: true, message: 'Counselor deleted' });
        } catch (err) {
            try { if (conn) await conn.rollback(); } catch (e) { /* ignore */ }
            console.error('Error deleting counselor:', err);
            return res.status(500).json({ success: false, message: 'Server error', error: err.message });
        } finally {
            try { if (conn) conn.release(); } catch (e) { /* ignore */ }
        }
    });

    router.post('/counselor/reveal', async (req, res) => {
        try {
            const { adminEmail, adminPassword, counselorId } = req.body;
            if (!adminEmail || !adminPassword || !counselorId) {
                return res.status(400).json({ success: false, message: 'Missing required fields' });
            }

            const conn = db.promise();
            // Verify admin credentials (bcrypt + legacy plaintext migration)
            const [adminRows] = await conn.query('SELECT * FROM tbl_staffaccounts WHERE email = ?', [adminEmail]);
            if (!adminRows || adminRows.length === 0) return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
            const admin = adminRows[0];
            let adminMatch = false;
            try { adminMatch = await bcrypt.compare(adminPassword, admin.password || ''); } catch (e) { adminMatch = false; }
            if (!adminMatch && admin.password === adminPassword) {
                try { const newHash = await bcrypt.hash(adminPassword, SALT_ROUNDS); await conn.query('UPDATE tbl_staffaccounts SET password = ? WHERE staffAccount_ID = ?', [newHash, admin.staffAccount_ID]); adminMatch = true; } catch (e) { console.error('[admin verify] migration failed', e); }
            }
            if (!adminMatch) return res.status(401).json({ success: false, message: 'Invalid admin credentials' });

            // Fetch counselor
            // Try to select the reversible encrypted column if present
            const r = await conn.query('SELECT staffAccount_ID, name, email, password FROM tbl_staffaccounts WHERE staffAccount_ID = ? AND staffRole_ID = 1', [counselorId]);
            const rows = r[0];
            if (!rows || rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Counselor not found' });
            }

            const counselor = rows[0];
            // Use the `password` column (it should contain reversible ciphertext or possibly plaintext)
            const stored = (counselor.password || '').toString();

            // If there's no stored value (NULL or empty), generate a temporary password,
            // encrypt it, store it in `password`, then return the temp to admin.
            if (!stored) {
                // generate an 8-char temp password
                const generateTemp = () => {
                    const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
                    const numbers = '0123456789';
                    const specials = '!@#$%^&*()-_=+[]{};:<>?,.';
                    const all = letters + numbers + specials;
                    const desiredLength = 8;
                    let pw = '';
                    pw += letters[Math.floor(Math.random() * letters.length)];
                    pw += numbers[Math.floor(Math.random() * numbers.length)];
                    pw += specials[Math.floor(Math.random() * specials.length)];
                    for (let i = 3; i < desiredLength; i++) pw += all[Math.floor(Math.random() * all.length)];
                    return pw.split('').sort(() => 0.5 - Math.random()).join('');
                };

                const tempPw = generateTemp();
                    try {
                        const enc = encrypt(tempPw);
                        await conn.query('UPDATE tbl_staffaccounts SET password = ? WHERE staffAccount_ID = ?', [enc, counselor.staffAccount_ID]);

                        // Log reveal action
                    try {
                        const adminId = req.user && (req.user.id || req.user.staffAccount_ID) ? (req.user.id || req.user.staffAccount_ID) : null;
                        const actionText = `Reveal generated temp password for ${counselor.email} (id:${counselor.staffAccount_ID})`;
                        await db.promise().query('INSERT INTO tbl_stafflogs (staffAccount_ID, action, date) VALUES (?, ?, UTC_TIMESTAMP())', [adminId, actionText]);
                    } catch (logErr) { console.warn('Failed to write reveal log:', logErr); }

                    return res.json({ success: true, data: { staffAccount_ID: counselor.staffAccount_ID, name: counselor.name, email: counselor.email, password: tempPw } });
                } catch (err) {
                    console.error('Failed to generate/store temporary password during reveal:', err);
                    return res.status(500).json({ success: false, message: 'Failed to generate temporary password. Ensure PASSWORD_REVEAL_KEY is set.' });
                }
            }

            // If stored looks like an encrypted ciphertext (not bcrypt), attempt to decrypt and return
            if (stored && !stored.startsWith('$2')) {
                try {
                    const decrypted = decrypt(stored);
                    return res.json({ success: true, data: { staffAccount_ID: counselor.staffAccount_ID, name: counselor.name, email: counselor.email, password: decrypted } });
                } catch (dErr) {
                    // Not decryptable - treat as possible legacy plaintext: encrypt it and overwrite stored plaintext
                    try {
                        const enc = encrypt(stored);
                        // Overwrite plaintext in `password` with reversible ciphertext.
                        await conn.query('UPDATE tbl_staffaccounts SET password = ? WHERE staffAccount_ID = ?', [enc, counselor.staffAccount_ID]);
                        // Return the original plaintext to the admin (we just stored the encrypted form)
                        return res.json({ success: true, data: { staffAccount_ID: counselor.staffAccount_ID, name: counselor.name, email: counselor.email, password: stored } });
                    } catch (encErr) {
                        console.warn('Failed to encrypt legacy plaintext password during reveal:', encErr);
                        // Fall back: return plaintext but do not write anything to DB
                        return res.json({ success: true, data: { staffAccount_ID: counselor.staffAccount_ID, name: counselor.name, email: counselor.email, password: stored } });
                    }
                }
            }

            // Else: stored password is hashed with bcrypt and no reversible copy exists
            return res.status(400).json({ success: false, message: 'Password is stored hashed and no reversible copy exists. Use send-password or change-password to reset it.' });
        } catch (err) {
            console.error('Error revealing counselor password:', err);
            return res.status(500).json({ success: false, message: 'Server error', error: err.message });
        }
    });

    router.post('/counselor/send-password', async (req, res) => {
        try {
            const { adminEmail, adminPassword, counselorId } = req.body;
            if (!adminEmail || !adminPassword || !counselorId) {
                return res.status(400).json({ success: false, message: 'Missing required fields' });
            }

            const conn = db.promise();
            // Verify admin credentials (bcrypt + legacy plaintext migration)
            const [adminRows] = await conn.query('SELECT * FROM tbl_staffaccounts WHERE email = ?', [adminEmail]);
            if (!adminRows || adminRows.length === 0) return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
            const admin = adminRows[0];
            let adminMatch = false;
            try { adminMatch = await bcrypt.compare(adminPassword, admin.password || ''); } catch (e) { adminMatch = false; }
            if (!adminMatch && admin.password === adminPassword) {
                try { const newHash = await bcrypt.hash(adminPassword, SALT_ROUNDS); await conn.query('UPDATE tbl_staffaccounts SET password = ? WHERE staffAccount_ID = ?', [newHash, admin.staffAccount_ID]); adminMatch = true; } catch (e) { console.error('[admin verify] migration failed', e); }
            }
            if (!adminMatch) return res.status(401).json({ success: false, message: 'Invalid admin credentials' });

            // Fetch counselor row
            const [rows] = await conn.query('SELECT staffAccount_ID, name, email, password FROM tbl_staffaccounts WHERE staffAccount_ID = ? AND staffRole_ID = 1', [counselorId]);
            if (!rows || rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Counselor not found' });
            }

            const counselor = rows[0];

            //nodemailer transporter
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'tigerroutes.contact@gmail.com',
                    pass: 'epki kwhr jdff egaj'
                }
            });

            // Attempt to decrypt the stored counselor password and send it.
            const storedVal = counselor.password || '';
            let pwToSend = null;
            if (storedVal) {
                try {
                    // Try to decrypt reversible ciphertext
                    pwToSend = decrypt(storedVal);
                } catch (dErr) {
                    // Treat as legacy plaintext: encrypt it and overwrite the stored value, but send the plaintext now
                    try {
                        const enc = encrypt(storedVal);
                        await conn.query('UPDATE tbl_staffaccounts SET password = ? WHERE staffAccount_ID = ?', [enc, counselor.staffAccount_ID]);
                    } catch (encErr) {
                        console.warn('Failed to encrypt legacy plaintext during send-password:', encErr);
                    }
                    pwToSend = storedVal;
                }
            } else {
                // No stored password: generate a temporary password, encrypt and store it
                const generateTemp = () => {
                    const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
                    const numbers = '0123456789';
                    const specials = '!@#$%^&*()-_=+[]{};:<>?,.';
                    const all = letters + numbers + specials;
                    const desiredLength = 8;
                    let pw = '';
                    pw += letters[Math.floor(Math.random() * letters.length)];
                    pw += numbers[Math.floor(Math.random() * numbers.length)];
                    pw += specials[Math.floor(Math.random() * specials.length)];
                    for (let i = 3; i < desiredLength; i++) pw += all[Math.floor(Math.random() * all.length)];
                    return pw.split('').sort(() => 0.5 - Math.random()).join('');
                };
                const tempPw = generateTemp();
                try {
                    const enc = encrypt(tempPw);
                    try {
                        await conn.query('UPDATE tbl_staffaccounts SET password = ? WHERE staffAccount_ID = ?', [enc, counselor.staffAccount_ID]);
                    } catch (e) {
                        await conn.query('UPDATE tbl_staffaccounts SET password = ? WHERE staffAccount_ID = ?', [enc, counselor.staffAccount_ID]);
                    }
                } catch (err) {
                    console.error('Failed to generate/store temporary password during send-password:', err);
                    return res.status(500).json({ success: false, message: 'Failed to generate temporary password. Ensure PASSWORD_REVEAL_KEY is set.' });
                }
                pwToSend = tempPw;
            }

            const mailOptions = {
                from: 'tigerroutes.contact@gmail.com',
                to: counselor.email,
                subject: 'TigerRoutes — Your Counselor Account Details',
                // Plain-text fallback for clients that don't render HTML
                text: `Hello ${counselor.name},\n\nYour TigerRoutes counselor account has been created/updated.\nEmail: ${counselor.email}\nPassword: ${pwToSend}\n\nLog in: http://localhost:3000/admin\n\nPlease change your password after first login.`,
                // HTML email with inline CID logo, clear details table and CTA button
                html: `
                  <div style="font-family: Inter, Arial, sans-serif; background:#f3f4f6; padding:24px;">
                    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 24px rgba(17,24,39,0.06);">
                      <div style="padding:28px 32px;text-align:center;background:linear-gradient(90deg,#fffaf0,#fffdf7);">
                        <img src="cid:tiger_logo" alt="TigerRoutes" style="width:120px;height:auto;display:block;margin:0 auto 12px;" />
                        <h1 style="margin:0;font-size:20px;color:#111827;font-weight:600;">Counselor Account Details</h1>
                        <p style="margin:8px 0 0;color:#6b7280;font-size:13px;">Welcome to TigerRoutes — please keep this information secure.</p>
                      </div>
                      <div style="padding:20px 32px 28px;color:#374151;font-size:14px;line-height:1.5;">
                        <p style="margin:0 0 12px;">Hello <strong>${counselor.name}</strong>,</p>
                        <p style="margin:0 0 16px;">Your counselor account has been created/updated. Use the credentials below to sign in. For security, change your password after logging in.</p>

                        <table role="presentation" style="width:100%;margin:8px 0 18px;border-collapse:collapse;">
                          <tr>
                            <td style="padding:8px 12px;background:#f9fafb;border-radius:8px 0 0 8px;width:120px;font-weight:600;color:#111827;">Email</td>
                            <td style="padding:8px 12px;background:#f9fafb;border-radius:0 8px 8px 0;color:#111827;">${counselor.email}</td>
                          </tr>
                                                    <tr>
                                                        <td style="padding:8px 12px;border-radius:8px 0 0 8px;font-weight:600;color:#111827;">Password</td>
                                                        <td style="padding:8px 12px;border-radius:0 8px 8px 0;color:#111827;"><code style="background:#fff2d7;padding:4px 8px;border-radius:6px;color:#7c2d12;font-weight:700;">${pwToSend}</code></td>
                                                    </tr>
                        </table>

                        <div style="text-align:center;margin-top:8px;">
                          <a href="http://localhost:3000/admin" target="_blank" rel="noopener" style="display:inline-block;padding:12px 20px;border-radius:8px;background:#F6BE1E;color:#111827;font-weight:700;text-decoration:none;box-shadow:0 6px 18px rgba(246,190,30,0.18);">
                            Go to Admin Login
                          </a>
                        </div>

                        <p style="margin:16px 0 0;color:#6b7280;font-size:12px;">If you did not request this account or believe this is an error, contact your administrator immediately.</p>
                      </div>
                      <div style="padding:12px 20px;background:#fafafa;border-top:1px solid #f3f4f6;text-align:center;color:#9ca3af;font-size:12px;">
                        &copy; 2025 TigerRoutes. All rights reserved.
                      </div>
                    </div>
                  </div>
                 `,
                attachments: [
                  {
                    filename: '04_TigerRoutes_Logo.png',
                    path: path.join(__dirname, '..', 'public', 'images', '02_TigerRoutes_Logo.png'),
                    cid: 'tiger_logo'
                  }
                ]
            };
            try {
                await transporter.sendMail(mailOptions);
            } catch (mailErr) {
                // Log full error for debugging (stack/response if available)
                console.error('Failed to send counselor password email:', mailErr);
                if (mailErr && mailErr.response) console.error('Mailer response:', mailErr.response);
                // Return the error message to the caller to aid debugging during development
                return res.status(500).json({ success: false, message: 'Failed to send email', error: mailErr.message || String(mailErr) });
            }

            //Logging
            try {
                const adminId = adminRows && adminRows[0] ? adminRows[0].staffAccount_ID : null;
                const actionText = `Sent counselor password to ${counselor.email} for ${counselor.name} (id:${counselor.staffAccount_ID})`;
                await db.promise().query('INSERT INTO tbl_stafflogs (staffAccount_ID, action, date) VALUES (?, ?, UTC_TIMESTAMP())', [adminId || null, actionText]);
            } catch (logErr) {
                console.warn('Failed to write staff log for send-password:', logErr);
            }

            return res.json({ success: true });
        } catch (err) {
            console.error('Error in send-password:', err);
            return res.status(500).json({ success: false, message: 'Server error', error: err.message });
        }
    });

    // POST: Change counselor password (generates a new random password and updates DB)
    router.post('/counselor/change-password', async (req, res) => {
        try {
            const { adminEmail, adminPassword, counselorId } = req.body;
            if (!adminEmail || !adminPassword || !counselorId) {
                return res.status(400).json({ success: false, message: 'Missing required fields' });
            }

            const conn = db.promise();
            // Verify admin credentials (bcrypt + legacy plaintext migration)
            const [adminRows] = await conn.query('SELECT * FROM tbl_staffaccounts WHERE email = ?', [adminEmail]);
            if (!adminRows || adminRows.length === 0) return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
            const admin = adminRows[0];
            let adminMatch = false;
            try { adminMatch = await bcrypt.compare(adminPassword, admin.password || ''); } catch (e) { adminMatch = false; }
            if (!adminMatch && admin.password === adminPassword) {
                try { const newHash = await bcrypt.hash(adminPassword, SALT_ROUNDS); await conn.query('UPDATE tbl_staffaccounts SET password = ? WHERE staffAccount_ID = ?', [newHash, admin.staffAccount_ID]); adminMatch = true; } catch (e) { console.error('[admin verify] migration failed', e); }
            }
            if (!adminMatch) return res.status(401).json({ success: false, message: 'Invalid admin credentials' });

            // ensure counselor exists
            const [rows] = await conn.query('SELECT staffAccount_ID FROM tbl_staffaccounts WHERE staffAccount_ID = ? AND staffRole_ID = 1', [counselorId]);
            if (!rows || rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Counselor not found' });
            }

            // generate new 8-character password (letters, numbers, special chars)
            const generatePassword = () => {
                const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
                const numbers = '0123456789';
                const specials = '!@#$%^&*()-_=+[]{};:<>?,.';
                const all = letters + numbers + specials;
                const desiredLength = 8;
                let pw = '';
                pw += letters[Math.floor(Math.random() * letters.length)];
                pw += numbers[Math.floor(Math.random() * numbers.length)];
                pw += specials[Math.floor(Math.random() * specials.length)];
                for (let i = 3; i < desiredLength; i++) pw += all[Math.floor(Math.random() * all.length)];
                pw = pw.split('').sort(() => 0.5 - Math.random()).join('');
                return pw;
            };

            const newPassword = generatePassword();

            // Update counselor password (store hashed)
            let encryptedNew = null;
            try { encryptedNew = encrypt(newPassword); } catch (e) { console.warn('Encryption unavailable for change-password:', e && e.message ? e.message : e); }
            if (encryptedNew !== null) {
                try {
                    await conn.query('UPDATE tbl_staffaccounts SET password = ? WHERE staffAccount_ID = ?', [encryptedNew, counselorId]);
                } catch (e) {
                    await conn.query('UPDATE tbl_staffaccounts SET password = ? WHERE staffAccount_ID = ?', [encryptedNew, counselorId]);
                }
            } else {
                // If encryption unavailable, store plaintext temporarily (not recommended)
                await conn.query('UPDATE tbl_staffaccounts SET password = ? WHERE staffAccount_ID = ?', [newPassword, counselorId]);
            }

            // Log the change
            try {
                const adminId = admin && admin.staffAccount_ID ? admin.staffAccount_ID : null;
                const actionText = `Changed counselor password for id:${counselorId}`;
                await conn.query('INSERT INTO tbl_stafflogs (staffAccount_ID, action, date) VALUES (?, ?, UTC_TIMESTAMP())', [adminId || null, actionText]);
            } catch (logErr) {
                console.warn('Failed to write staff log for change-password:', logErr);
            }

            return res.json({ success: true, data: { newPassword } });
        } catch (err) {
            console.error('Error in change-password:', err);
            return res.status(500).json({ success: false, message: 'Server error', error: err.message });
        }
    });
    return router;
};

// New endpoint to reveal a counselor's password to an authenticated admin.
// Expects { adminEmail, adminPassword, counselorId } in body.
// Verifies admin credentials then returns the counselor's password (as stored).
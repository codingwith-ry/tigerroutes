
const express = require('express');
const nodemailer = require('nodemailer');

module.exports = (db) => {

    const router = express.Router();

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
            // Generate a random 6-digit password for the counselor
            const generatedPassword = String(Math.floor(100000 + Math.random() * 900000));

            // staffRole_ID = 1 is for counselor
            const accountQuery = `
                INSERT INTO tbl_staffaccounts (name, email, password, staffRole_ID, staffProfile_ID, status)
                VALUES (?, ?, ?, ?, ?, ?)`;
            const statusValue = status === 'Active' ? 1 : 0;

            const [accountResult] = await db.promise().query(accountQuery, [
                name,
                email,
                generatedPassword,
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

            res.status(201).json({
                success: true,
                message: 'Counselor added successfully',
                data: {
                    staffAccount_ID: accountResult.insertId,
                    staffProfile_ID: staffProfileId,
                    name,
                    email,
                    password: generatedPassword
                }
            });
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
                    s.strandName as strand
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
        const conn = db.promise();
        try {
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
            try { await conn.rollback(); } catch (e) { console.error('Rollback error', e); }
            console.error(err);
            res.status(500).json({ success:false, message: 'DB error', error: err.message});
        }
    });

    router.post('/counselor/delete', async (req, res) => {
        try {
            const { id, adminEmail, adminPassword } = req.body;
            if (!id || !adminEmail || !adminPassword) {
                return res.status(400).json({ success: false, message: 'Missing required fields' });
            }

            const conn = db.promise();

            // Verify admin credentials
            const [adminRows] = await conn.query('SELECT * FROM tbl_staffaccounts WHERE email = ? AND password = ?', [adminEmail, adminPassword]);
            if (!adminRows || adminRows.length === 0) {
                return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
            }

            // Perform delete within a transaction
            await conn.beginTransaction();

            // Get the profile id (if any) and name of the counselor to delete
            const [acctRows] = await conn.query('SELECT staffProfile_ID, name FROM tbl_staffaccounts WHERE staffAccount_ID = ?', [id]);
            const staffProfileId = acctRows && acctRows[0] ? acctRows[0].staffProfile_ID : null;
            const counselorName = acctRows && acctRows[0] ? acctRows[0].name : null;

            // Delete the staff account
            const [delResult] = await conn.query('DELETE FROM tbl_staffaccounts WHERE staffAccount_ID = ?', [id]);

            // Optionally delete the profile row if it exists
            if (staffProfileId) {
                await conn.query('DELETE FROM tbl_staffprofiles WHERE staffProfile_ID = ?', [staffProfileId]);
            }

            await conn.commit();

            // Log the delete action to tbl_stafflogs (Philippines time)
            try {
                const adminId = adminRows && adminRows[0] ? adminRows[0].staffAccount_ID : null;
                const actionText = counselorName ? `Delete counselor ${counselorName} (id:${id})` : `Delete counselor (id:${id})`;
                // Store UTC timestamp in DB
                await db.promise().query('INSERT INTO tbl_stafflogs (staffAccount_ID, action, date) VALUES (?, ?, UTC_TIMESTAMP())', [adminId || null, actionText]);
            } catch (logErr) {
                console.warn('Failed to write staff log for delete counselor:', logErr);
            }

            return res.json({ success: true, message: 'Counselor deleted' });
        } catch (err) {
            try { await db.promise().rollback(); } catch (e) { /* ignore */ }
            console.error('Error deleting counselor:', err);
            return res.status(500).json({ success: false, message: 'Server error', error: err.message });
        }
    });

    router.post('/counselor/reveal', async (req, res) => {
        try {
            const { adminEmail, adminPassword, counselorId } = req.body;
            if (!adminEmail || !adminPassword || !counselorId) {
                return res.status(400).json({ success: false, message: 'Missing required fields' });
            }

            const conn = db.promise();
            // Verify admin credentials
            const [adminRows] = await conn.query('SELECT * FROM tbl_staffaccounts WHERE email = ? AND password = ?', [adminEmail, adminPassword]);
            if (!adminRows || adminRows.length === 0) {
                return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
            }

            // Fetch counselor password
            const [rows] = await conn.query('SELECT staffAccount_ID, name, email, password FROM tbl_staffaccounts WHERE staffAccount_ID = ? AND staffRole_ID = 1', [counselorId]);
            if (!rows || rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Counselor not found' });
            }

            const counselor = rows[0];
            // Return the stored password to the authenticated admin (note: passwords are stored plaintext in this schema)
            return res.json({ success: true, data: { staffAccount_ID: counselor.staffAccount_ID, name: counselor.name, email: counselor.email, password: counselor.password } });
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
            //Verify admin credentials
            const [adminRows] = await conn.query('SELECT * FROM tbl_staffaccounts WHERE email = ? AND password = ?', [adminEmail, adminPassword]);
            if (!adminRows || adminRows.length === 0) {
                return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
            }

            //Fetch counselor password and email
            const [rows] = await conn.query('SELECT staffAccount_ID, name, email, password FROM tbl_staffaccounts WHERE staffAccount_ID = ? AND staffRole_ID = 1', [counselorId]);
            if (!rows || rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Counselor not found' });
            }

            const counselor = rows[0];

            //nodemailer transporter
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'dominicxandy.adino.cics@ust.edu.ph',
                    pass: 'fdvp mbeg iold wmfe'
                }
            });

            const mailOptions = {
                from: 'dominicxandy.adino.cics@ust.edu.ph',
                to: counselor.email,
                subject: 'TigerRoutes Counselor Account Details',
                html: `
                    <p>Dear ${counselor.name},</p>
                    <p>Your TigerRoutes counselor account has been created/updated. Here are your account details:</p>
                    <ul>
                      <li><strong>Email:</strong> ${counselor.email}</li>
                      <li><strong>Password:</strong> <code>${counselor.password}</code></li>
                    </ul>
                    <p>You can log in at <a href="http://localhost:3000/login">TigerRoutes Login</a>. For security, please change your password after logging in.</p>
                    <p>If you did not request this, please contact your administrator immediately.</p>
                `
            };

            try {
                await transporter.sendMail(mailOptions);
            } catch (mailErr) {
                console.error('Failed to send counselor password email:', mailErr);
                return res.status(500).json({ success: false, message: 'Failed to send email' });
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
    return router;
};

// New endpoint to reveal a counselor's password to an authenticated admin.
// Expects { adminEmail, adminPassword, counselorId } in body.
// Verifies admin credentials then returns the counselor's password (as stored).
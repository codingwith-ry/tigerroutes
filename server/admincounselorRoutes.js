
const express = require('express');

module.exports = (db) => {

    const router = express.Router();

    // POST: Add a new counselor.
    router.post('/counselor/add', async (req, res) => {
        const { name, email, strand, status, officeLocation, consultationHours, about } = req.body;

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
            // Default password until password field is created for add counselor
            const defaultPassword = '12345';

            // staffRole_ID = 1 is for counselor
            const accountQuery = `
                INSERT INTO tbl_staffaccounts (name, email, password, staffRole_ID, staffProfile_ID, status)
                VALUES (?, ?, ?, ?, ?, ?)`;
            const statusValue = status === 'Active' ? 1 : 0;

            const [accountResult] = await db.promise().query(accountQuery, [
                name,
                email,
                defaultPassword,
                1,
                staffProfileId,
                statusValue
            ]);

            res.status(201).json({
                success: true,
                message: 'Counselor added successfully',
                data: {
                    staffAccount_ID: accountResult.insertId,
                    staffProfile_ID: staffProfileId,
                    name,
                    email
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

    router.put('/counselor/:id', async (req, res) => {
        const id = req.params.id;
        const { name, email, strand, status, officeLocation, consultationHours, about } = req.body;
        // db in this project is a Connection (created via mysql.createConnection).
        // The promise() wrapper on a Connection exposes beginTransaction/commit/rollback and query.
        const conn = db.promise();
        try {
            await conn.beginTransaction();
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
            res.json({ success: true, message: 'Updated' });
        } catch (err) {
            try { await conn.rollback(); } catch (e) { console.error('Rollback error', e); }
            console.error(err);
            res.status(500).json({ success:false, message: 'DB error', error: err.message});
        }
    });
    return router;
};
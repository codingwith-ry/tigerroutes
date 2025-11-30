//This File is for admin dashboard backend



const express = require('express');
const requireJwt = require('./middleware/requireJwt');

module.exports = (db) => {
    const router = express.Router();
    // Require admin JWT for dashboard endpoints
    router.use(requireJwt);

    //Admin dashboard initialization
    router.get('/dashboard-stats', (req, res) => {
        
        //Count total students
        const studentsQuery = 'SELECT COUNT(*) as totalStudents FROM tbl_studentaccounts';

        // Count total assessments (rows) and number of distinct students who have >=1 assessment
        // - totalAssessments: total rows in tbl_studentassessments (shown as the main "Completed Assessments" number)
        // - completedStudents: number of unique studentAccount_ID values (used to compute completion rate)
        const assessmentsQuery = `SELECT COUNT(*) AS totalAssessments, COUNT(DISTINCT studentAccount_ID) AS completedStudents FROM tbl_studentassessments`;

                //Count overall alignment (average of per-assessment averages using only track-aligned recommendations)
                // This matches the assessments listing which averages only recommendations where track_aligned = 'Y'
                const alignmentQuery = `
                SELECT ROUND(AVG(avgScore), 2) AS overallAlignment
                FROM (
                    SELECT AVG(r.alignmentScore) AS avgScore
                    FROM tbl_recommendations r
                    WHERE r.track_aligned = 'Y'
                    GROUP BY r.studentAssessment_ID
                ) t
                `;


        db.query(studentsQuery, (err1, studentsResult) => {
            if (err1) {
                return res.status(500).json({ error: err1.message });
            }
            
            db.query(assessmentsQuery, (err2, assessmentsResult) => {
                if (err2) {
                    return res.status(500).json({ error: err2.message });
                }

                db.query(alignmentQuery, (err3, alignmentResult) => {
                    if (err3) return res.status(500).json({ error: err3.message });
                



                    // Count total counselors (staffRole_ID = 1) and include in response
                    const counselorsQuery = 'SELECT COUNT(*) AS totalCounselors FROM tbl_staffaccounts WHERE staffRole_ID = 1';
                    db.query(counselorsQuery, (err4, counselorsResult) => {
                        if (err4) {
                            console.warn('Failed to fetch total counselors:', err4.message || err4);
                        }

                        const totalCounselors = (counselorsResult && counselorsResult[0] && Number(counselorsResult[0].totalCounselors)) || 0;

                                res.json({
                                    success: true,
                                    data: {
                                        totalStudents: studentsResult[0].totalStudents,
                                        // total number of assessment records
                                        completedAssessments: assessmentsResult[0].totalAssessments || 0,
                                        // number of students with at least one assessment (for completion rate)
                                        completedStudents: assessmentsResult[0].completedStudents || 0,
                                        overallAlignment: alignmentResult[0].overallAlignment || 0,
                                        totalCounselors: totalCounselors
                                    }
                                });
                    });
                });
            });
        });
    });


    router.get('/strand-alignment', (req, res) => {
        const sql = `
        SELECT
        s.strandName,
        ROUND(AVG(ts.top_score), 2) AS avgAlignment,
        COUNT(*) as assessments_count
        FROM (
        SELECT
            a.studentAssessment_ID,
            a.assessmentProfile_ID,
            MAX(r.alignmentScore) AS top_score
            FROM tbl_studentassessments a
            JOIN tbl_recommendations r
                ON r.studentAssessment_ID = a.studentAssessment_ID
                -- Incase I need to only use track aligned check
                WHERE r.track_aligned = 'Y'
                GROUP BY a.studentAssessment_ID, a.studentAccount_ID, a.assessmentProfile_ID
        ) ts
        JOIN tbl_assessmentprofiles ap
            ON ap.assessmentProfile_ID = ts.assessmentProfile_ID
        JOIN tbl_strands s
            ON s.strand_ID = ap.strand_ID
        GROUP BY s.strand_ID, s.strandName
        ORDER BY s.strandName;`;

        db.query(sql, (err, rows) => {
            if (err) return res.status(500).json({ success: false, error: err.message});
            res.json({
                success: true,
                data: rows.map(r => ({
                    strandName: r.strandName,
                    avgAlignment: Number(r.avgAlignment),
                    assessments: Number(r.assessments_count)
                }))
            });
        });
    });

    router.get('/top-programs', (req, res) => {
        const sql = `
        SELECT
            p.programName,
            COUNT(*) AS recommendations,
            ROUND(AVG(r.alignmentScore), 2) AS avgAlignment
        FROM tbl_recommendations r
        JOIN tbl_programs p ON p.program_ID = r.program_ID
        GROUP BY p.program_ID, p.programName
        ORDER BY recommendations DESC
        LIMIT 5`;

        db.query(sql, (err, rows) => {
            if (err) return res.status(500).json({ success: false, error: err.message});
            res.json({
                success: true,
                data: rows.map(r => ({
                    programName: r.programName,
                    recommendations: Number(r.recommendations),
                    avgAlignment: Number(r.avgAlignment)
                }))
            });
        });
    });

    // Get students who have no completed assessments (may have pending assessments)
    router.get('/unassessed-students', (req, res) => {
        const sql = `
        SELECT s.studentAccount_ID, s.name, s.email, pa.pendingAssessment_ID
        FROM tbl_studentaccounts s
        LEFT JOIN tbl_pendingassessments pa ON pa.studentAccount_ID = s.studentAccount_ID
        WHERE NOT EXISTS (
            SELECT 1 FROM tbl_studentassessments sa WHERE sa.studentAccount_ID = s.studentAccount_ID
        )
        ORDER BY s.name;
        `;

        db.query(sql, (err, rows) => {
            if (err) return res.status(500).json({ success: false, error: err.message });
            const data = (rows || []).map(r => ({
                studentAccount_ID: r.studentAccount_ID,
                name: r.name,
                email: r.email,
                pendingAssessment_ID: r.pendingAssessment_ID || null
            }));
            res.json({ success: true, data });
        });
    });

    // Send reminder email to student about completing their assessment
    router.post('/remind-student', async (req, res) => {
        try {
            const { studentAccount_ID } = req.body;
            if (!studentAccount_ID) return res.status(400).json({ success: false, message: 'studentAccount_ID is required' });

            // fetch student email
            const [rows] = await db.promise().query('SELECT name, email FROM tbl_studentaccounts WHERE studentAccount_ID = ? LIMIT 1', [studentAccount_ID]);
            if (!rows || rows.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });

            const student = rows[0];

            // create transporter (dev) - consider moving to shared util and using env vars
            const nodemailer = require('nodemailer');
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.SMTP_USER || 'tigerroutes.contact@gmail.com',
                    pass: process.env.SMTP_PASS || 'epki kwhr jdff egaj'
                }
            });

            const mailOptions = {
                from: process.env.SMTP_FROM || 'tigerroutes.contact@gmail.com',
                to: student.email,
                subject: 'Reminder: Please complete your TigerRoutes assessment',
                html: `
                    <p>Hi ${student.name || 'Student'},</p>
                    <p>This is a friendly reminder to complete your TigerRoutes assessment. Your responses help generate program recommendations tailored for you.</p>
                    <p>Thanks,<br/>TigerRoutes Team</p>
                `
            };

            await transporter.sendMail(mailOptions);
            return res.json({ success: true, message: 'Reminder sent' });
        } catch (err) {
            console.error('[remind-student] error:', err && err.stack ? err.stack : err);
            return res.status(500).json({ success: false, message: 'Failed to send reminder' });
        }
    });




    return router;
};
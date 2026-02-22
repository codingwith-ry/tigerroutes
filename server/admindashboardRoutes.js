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
        // Match the strand-analytics logic: average of per-assessment averages for track-aligned recommendations
        const sql = `
        SELECT
            s.strand_ID,
            s.strandName,
            ROUND(AVG(pa.avgAlignment), 2) AS avgAlignment,
            COUNT(DISTINCT a_res.studentAssessment_ID) AS assessments_count
        FROM tbl_strands s
        LEFT JOIN (
            SELECT
                a.studentAssessment_ID,
                a.studentAccount_ID,
                a.assessmentProfile_ID,
                ap.strand_ID AS resolved_strand
            FROM tbl_studentassessments a
            LEFT JOIN tbl_assessmentprofiles ap ON a.assessmentProfile_ID = ap.assessmentProfile_ID
        ) a_res ON a_res.resolved_strand = s.strand_ID
        LEFT JOIN (
            SELECT studentAssessment_ID, AVG(alignmentScore) AS avgAlignment
            FROM tbl_recommendations
            WHERE track_aligned = 'Y'
            GROUP BY studentAssessment_ID
        ) pa ON pa.studentAssessment_ID = a_res.studentAssessment_ID
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
                SELECT
                    s.studentAccount_ID,
                    s.name,
                    s.email,
                    pa.pendingAssessment_ID,
                        (
                            SELECT CONCAT(DATE_FORMAT(CONVERT_TZ(sl.date, @@session.time_zone, '+00:00'), '%Y-%m-%dT%H:%i:%s'), 'Z')
                            FROM tbl_stafflogs sl
                            WHERE sl.action LIKE 'Reminder sent to student %'
                                AND sl.action LIKE CONCAT('%', s.email, '%')
                            ORDER BY sl.date DESC
                            LIMIT 1
                        ) AS lastReminderDate
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
                // Ensure lastReminderDate is serialized as an explicit UTC ISO string so clients
                // interpret it as UTC. MySQL may return Date objects or naive strings depending
                // on driver/config, so normalize here.
                lastReminderDate: r.lastReminderDate ? new Date(r.lastReminderDate).toISOString() : null,
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
                subject: '🎓 Complete Your TigerRoutes Assessment – Find Your Perfect UST Program!',
                attachments: [{
                    filename: 'TigerRoutes_Icon.webp',
                    path: require('path').join(__dirname, '../public/images/TigerRoutes_Icon.webp'),
                    cid: 'tigericon'
                }],
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FFFCED; }
                            .header { background: linear-gradient(135deg, #FB9724 0%, #FBBF24 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
                            .header h1 { margin: 0; font-size: 24px; font-weight: bold; }
                            .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                            .btn { display: inline-block; padding: 12px 30px; background-color: #FB9724; color: white !important; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; transition: background-color 0.3s; }
                            .btn:hover { background-color: #FBBF24; }
                            .benefits { background-color: #FFF9F3; padding: 15px; border-left: 4px solid #FB9724; margin: 20px 0; }
                            .benefits ul { margin: 10px 0; padding-left: 20px; }
                            .benefits li { margin: 8px 0; }
                            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                            .highlight { color: #FB9724; font-weight: bold; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1><img src="cid:tigericon" alt="Tiger Icon" style="height: 24px; vertical-align: middle; margin-right: 2px;" /> TigerRoutes Assessment Reminder</h1>
                            </div>
                            <div class="content">
                                <p>Hi <strong>${student.name || 'Thomasian'}</strong>,</p>
                                
                                <p>We noticed you haven't completed your <span class="highlight">TigerRoutes Career Assessment</span> yet. This personalized assessment is designed to help you discover the perfect UST program that aligns with your interests, personality, and academic strengths.</p>
                                
                                <div class="benefits">
                                    <h3 style="margin-top: 0; color: #FB9724;">✨ Why Complete Your Assessment?</h3>
                                    <ul>
                                        <li><strong>Personalized Recommendations:</strong> Get program matches based on your unique profile</li>
                                        <li><strong>Score-Driven Insights:</strong> Our scoring engine analyzes 40+ UST programs to find your best fit</li>
                                        <li><strong>Career Clarity:</strong> Understand how your interests align with different career paths</li>
                                        <li><strong>Make Informed Decisions:</strong> Receive data-backed guidance for your college journey</li>
                                    </ul>
                                </div>
                                
                                <p><strong>Time Required:</strong> Just 15-20 minutes to complete both RIASEC and Big Five assessments</p>
                                
                                <div style="text-align: center;">
                                    <a href="${process.env.REACT_APP_API_URL || 'http://localhost:3000'}" class="btn">
                                        Complete Your Assessment Now
                                    </a>
                                </div>
                                
                                <p style="margin-top: 30px;">Your journey to finding the right program starts with understanding yourself better. Take this important step today!</p>
                                
                                <p style="margin-top: 30px;">If you have any questions or need assistance, feel free to reach out to your guidance counselor or contact us at <a href="mailto:tigerroutes.contact@gmail.com" style="color: #FB9724;">tigerroutes.contact@gmail.com</a>.</p>
                                
                                <p style="margin-top: 30px;">Best regards,<br/>
                                <strong>The TigerRoutes Team</strong><br/>
                                <em>Navigate Your Perfect Career Path</em> 🎓</p>
                            </div>
                            <div class="footer">
                                <p>© ${new Date().getFullYear()} TigerRoutes - University of Santo Tomas Career Assessment System</p>
                                <p style="font-size: 11px; color: #999;">This is an automated reminder. Please do not reply to this email.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            };

            await transporter.sendMail(mailOptions);
            // Log staff action: who sent the reminder and to which student
            try {
                const staffId = req.user && req.user.id ? req.user.id : null;
                const actionText = `Reminder sent to student ${student.email} (ID:${studentAccount_ID})`;
                await db.promise().query('INSERT INTO tbl_stafflogs (staffAccount_ID, action, date) VALUES (?, ?, NOW())', [staffId, actionText]);
            } catch (logErr) {
                console.warn('[remind-student] failed to insert staff log', logErr && logErr.message ? logErr.message : logErr);
            }

            return res.json({ success: true, message: 'Reminder sent' });
        } catch (err) {
            console.error('[remind-student] error:', err && err.stack ? err.stack : err);
            return res.status(500).json({ success: false, message: 'Failed to send reminder' });
        }
    });

    return router;
};
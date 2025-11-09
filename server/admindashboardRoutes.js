//This File is for admin dashboard backend



const express = require('express');

module.exports = (db) => {
    const router = express.Router();

    //Admin dashboard initialization
    router.get('/admin/dashboard-stats', (req, res) => {
        
        //Count total students
        const studentsQuery = 'SELECT COUNT(*) as totalStudents FROM tbl_studentaccounts';

        //Count completed assessments
        const assessmentsQuery = 'SELECT COUNT(*) as completedAssessments FROM tbl_studentassessments';

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
                                completedAssessments: assessmentsResult[0].completedAssessments,
                                overallAlignment: alignmentResult[0].overallAlignment || 0,
                                totalCounselors: totalCounselors
                            }
                        });
                    });
                });
            });
        });
    });


    router.get('/admin/strand-alignment', (req, res) => {
        const sql = `
        SELECT
        s.strandName,
        ROUND(AVG(ts.top_score), 2) AS avgAlignment,
        COUNT(*) as assessments_count
        FROM (
        SELECT
            a.studentAssessment_ID,
            a.studentAccount_ID,
            MAX(r.alignmentScore) AS top_score
            FROM tbl_studentassessments a
            JOIN tbl_recommendations r
                ON r.studentAssessment_ID = a.studentAssessment_ID
                -- Incase I need to only use track aligned check
                WHERE r.track_aligned = 'Y'
                GROUP BY a.studentAssessment_ID, a.studentAccount_ID
        ) ts
        JOIN tbl_studentaccounts sa
            ON sa.studentAccount_ID = ts.studentAccount_ID
        JOIN tbl_studentprofiles sp
            ON sp.studentProfile_ID = sa.studentProfile_ID
        JOIN tbl_strands s
            ON s.strand_ID = sp.strand_ID
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

    router.get('/admin/top-programs', (req, res) => {
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




    return router;
};
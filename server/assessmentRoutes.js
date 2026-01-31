const express = require('express');

module.exports = (db) => {
    const router = express.Router();
    const requireAnyJwt = require('./middleware/requireAnyJwt');
    // Require either student (`tigerToken`) or staff (`tigerStaffToken`) JWT for assessment APIs
    router.use(requireAnyJwt);

    router.get('/assessment/profile', async (req, res) => {
        try {
            const { studentAccountId } = req.query;

            if (!studentAccountId) {
                return res.status(400).json({ error: 'studentAccountId is required' });
            }

            const query = `
            SELECT 
                sa.studentAccount_ID,
                sa.name,
                sa.email,
                sp.studentProfile_ID,
                sp.gradeLevel,
                sp.strand_ID,
                strands.strandName AS strand,
                sg.mathGrade,
                sg.scienceGrade,
                sg.englishGrade,
                sg.genAverageGrade
            FROM tbl_studentaccounts sa
            LEFT JOIN tbl_studentprofiles sp ON sa.studentprofile_ID = sp.studentprofile_ID
            LEFT JOIN tbl_strands strands ON sp.strand_ID = strands.strand_ID
            LEFT JOIN tbl_studentgrades sg ON sp.studentgrades_ID = sg.studentgrades_ID
            WHERE sa.studentAccount_ID = ?
            `;

            // Using db.query with promise wrapper
            db.query(query, [studentAccountId], (error, results) => {
                if (error) {
                    console.error('Database error:', error.message);
                    return res.status(500).json({ error: 'Database error', message: error.message });
                }

                if (!results.length) {
                    return res.status(404).json({ error: 'Student not found' });
                }

                const user = results[0];
                const userData = {
                    studentAccount_ID: user.studentAccount_ID,
                    name: user.name,
                    email: user.email,
                    contact: user.contact,
                    studentProfile_ID: user.studentProfile_ID,
                    gradeLevel: user.gradeLevel,
                    strandID: user.strand_ID,
                    strand: user.strand,
                    mathGrade: user.mathGrade,
                    scienceGrade: user.scienceGrade,
                    englishGrade: user.englishGrade,
                    genAverageGrade: user.genAverageGrade
                };

                return res.status(200).json({ success: true, userData });
            });
        } catch (error) {
            console.error('Error fetching student profile:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    router.post('/assessment/complete', (req, res) => {
        console.log("Assessment completion endpoint hit");
        const { studentAssessment_ID, studentAccount_ID, riasecResults, bigFiveResults } = req.body;

        const fetchStudentProfileDetails = `
        SELECT 
            sa.name, 
            sa.email, 
            sp.strand_ID, 
            sp.studentGrades_ID,
            s.strandName,
            sp.gradeLevel,
            sg.mathGrade,
            sg.scienceGrade,
            sg.englishGrade,
            sg.genAverageGrade
        FROM tbl_studentaccounts AS sa
        INNER JOIN tbl_studentprofiles AS sp
            ON sa.studentProfile_ID = sp.studentProfile_ID
        INNER JOIN tbl_strands AS s
            ON sp.strand_ID = s.strand_ID
        INNER JOIN tbl_studentgrades AS sg
            ON sp.studentGrades_ID = sg.studentGrades_ID
        WHERE sa.studentAccount_ID = ?;
        `;

        const studentProfileQuery = `INSERT INTO tbl_assessmentprofiles (mathGrade, scienceGrade, englishGrade, genAverageGrade, strand_ID, gradeLevel) VALUES (?, ?, ?, ?, ?, ?)`;
        

        const riasecQuery = `
            INSERT INTO tbl_riasecresults 
            (realistic, investigative, artistic, social, enterprising, conventional) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const bigFiveQuery = `
            INSERT INTO tbl_bigfiveresults 
            (openness, conscientiousness, extraversion, agreeableness, neuroticism) 
            VALUES (?, ?, ?, ?, ?)
        `;

        

        db.query(
            riasecQuery,
            [
                riasecResults.Realistic,
                riasecResults.Investigative,
                riasecResults.Artistic,
                riasecResults.Social,
                riasecResults.Enterprising,
                riasecResults.Conventional,
            ],
            (err, riasecResult) => {
                if (err) {
                    console.error('Error inserting RIASEC results:', err);
                    return res.status(500).json({ message: 'Error inserting RIASEC results' });
                }

                console.log("RIASEC insertId:", riasecResult.insertId);

                // Insert Big Five results only after RIASEC success
                db.query(
                    bigFiveQuery,
                    [
                        bigFiveResults.Openness,
                        bigFiveResults.Conscientiousness,
                        bigFiveResults.Extraversion,
                        bigFiveResults.Agreeableness,
                        bigFiveResults.Neuroticism,
                    ],
                    (err, bigFiveResult) => {
                        if (err) {
                            console.error('Error inserting Big Five results:', err);
                            return res.status(500).json({ message: 'Error inserting Big Five results' });
                        }

                        console.log("Big Five insertId:", bigFiveResult.insertId);

                        db.query(
                            fetchStudentProfileDetails,
                            [studentAccount_ID],
                            (err, profileResults) => {
                                if (err) {
                                    console.error('Error fetching student profile details:', err);
                                    return res.status(500).json({ message: 'Error fetching student profile details' });
                                }
                                var timestamp = new Date();

                                db.query(
                                    studentProfileQuery,
                                    [profileResults[0].mathGrade,
                                    profileResults[0].scienceGrade,
                                    profileResults[0].englishGrade,
                                    profileResults[0].genAverageGrade,
                                    profileResults[0].strand_ID,
                                    profileResults[0].gradeLevel],
                                    (err, assessmentProfileResult) => {
                                        if (err) {
                                            console.error('Error inserting Assessment Profile:', err);
                                            return res.status(500).json({ message: 'Error inserting Assessment Profile' });
                                        }
                                        const assessmentProfile_ID = assessmentProfileResult.insertId;

                                        const assessmentQuery = `INSERT INTO tbl_studentassessments (studentAssessment_ID, studentAccount_ID, assessmentProfile_ID, riasecResult_ID, bigFiveResult_ID, date) VALUES(?, ?, ?, ?, ?, ?)`;
                                        db.query(
                                            assessmentQuery,
                                            [
                                                studentAssessment_ID,
                                                studentAccount_ID,
                                                assessmentProfile_ID,
                                                riasecResult.insertId,
                                                bigFiveResult.insertId,
                                                timestamp
                                            ],
                                            async (err) => {
                                                if (err) {
                                                    console.error('Error inserting Student Assessment record:', err);
                                                    return res.status(500).json({ message: 'Error inserting Student Assessment record' });
                                                }

                                                let programsResponse;
                                                try {
                                                    const response = await fetch('http://localhost:8000/score', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({
                                                            studentGrades: {
                                                                mathGrade: profileResults[0].mathGrade,
                                                                scienceGrade: profileResults[0].scienceGrade,
                                                                englishGrade: profileResults[0].englishGrade,
                                                                genAverageGrade: profileResults[0].genAverageGrade
                                                            },
                                                            strand: profileResults[0].strandName,
                                                            riasec: riasecResults,
                                                            bigfive: bigFiveResults
                                                        })
                                                    });

                                                    programsResponse = await response.json();
                                                } catch (error) {
                                                    console.error('Error fetching program recommendations:', error);
                                                    return res.status(500).json({ message: 'Error fetching program recommendations' });
                                                }

                                                const allRecommendations = [
                                                    ...programsResponse.track_aligned.map(([name, data]) => ({
                                                        programName: name,
                                                        ...data,
                                                        trackAligned: 'Y'
                                                    })),
                                                    ...programsResponse.cross_track.map(([name, data]) => ({
                                                        programName: name,
                                                        ...data,
                                                        trackAligned: 'N'
                                                    }))
                                                ];

                                                for (const rec of allRecommendations) {
                                                    const { programName, score, breakdown, trackAligned } = rec;
                                                    const alignmentScore = score;
                                                    const breakdownJSON = JSON.stringify(breakdown);

                                                    // Get program_ID
                                                    const getProgramQuery = `SELECT program_ID FROM tbl_programs WHERE programName = ? LIMIT 1`;

                                                    db.query(getProgramQuery, [programName], (err, programResult) => {
                                                        if (err) {
                                                            console.error(`Error fetching program ID for ${programName}:`, err);
                                                            return;
                                                        }

                                                        if (programResult.length === 0) {
                                                            console.warn(`Program not found: ${programName}`);
                                                            return;
                                                        }

                                                        const program_ID = programResult[0].program_ID;

                                                        // Insert recommendation
                                                        const insertRecQuery = `
                                                            INSERT INTO tbl_recommendations 
                                                            (studentAssessment_ID, program_ID, alignmentScore, breakdown, track_aligned)
                                                            VALUES (?, ?, ?, ?, ?)
                                                        `;

                                                        db.query(
                                                            insertRecQuery,
                                                            [studentAssessment_ID, program_ID, alignmentScore, breakdownJSON, trackAligned],
                                                            (err) => {
                                                                if (err) {
                                                                    console.error(`Error inserting recommendation for ${programName}:`, err);
                                                                } else {
                                                                    console.log(`✅ Saved recommendation for ${programName} (${trackAligned})`);
                                                                }
                                                            }
                                                        );
                                                    });
                                                }

                                                
                                                return res.status(200).json({ success: true, message: 'Assessment completed successfully', programRecommendations: allRecommendations});
                                        });
                                    }
                                );
                                
                        });


                    }
                );
            }
        );
    });

    router.post('/assessment/assessmentDetails', (req, res) => {
        try {
            const { assessmentID, studentAccountId } = req.body;

            if (!assessmentID || !studentAccountId) {
                return res.json({ success: false, message: 'assessmentID and studentAccountId are required' });
            }

            const fetchPsychometricIDs = 'SELECT assessmentProfile_ID, studentAccount_ID, riasecResult_ID, bigFiveResult_ID, rating, feedback FROM tbl_studentassessments WHERE studentAssessment_ID = ? AND studentAccount_ID = ? LIMIT 1';

            db.query(fetchPsychometricIDs, [assessmentID, studentAccountId], (err, result) => {
                if (err) {
                    return res.json({ success: false, message: err.message });
                }

                if (result.length === 0) {
                    return res.json({ success: false, message: 'Assessment not found' });
                }

                const { assessmentProfile_ID, riasecResult_ID, bigFiveResult_ID } = result[0];

                // Fetch Student Profile
                const fetchStudentProfile = 'SELECT st.`name`, st.email, ap.gradeLevel, s.strandName, ap.mathGrade, ap.scienceGrade, ap.englishGrade, ap.genAverageGrade, sa.date FROM tbl_assessmentprofiles AS ap INNER JOIN tbl_strands AS s ON ap.strand_ID = s.strand_ID INNER JOIN tbl_studentassessments AS sa ON ap.assessmentProfile_ID = sa.assessmentProfile_ID INNER JOIN tbl_studentaccounts AS st ON sa.studentAccount_ID = st.studentAccount_ID WHERE ap.assessmentProfile_ID = ?';

                // Fetch RIASEC results
                const fetchRIASEC = 'SELECT * FROM tbl_riasecresults WHERE riasecResult_ID = ?';
                
                // Fetch Big Five results
                const fetchBigFive = 'SELECT * FROM tbl_bigfiveresults WHERE bigFiveResult_ID = ?';

                // Fetch program recommendations
                const fetchProgramRecoDetails = 'SELECT * FROM tbl_recommendations WHERE studentAssessment_ID = ?';

                // Fetch counselor notes if any
                const fetchCounselorNotes = 'SELECT cn.counselorNotes, cn.date, s.name AS counselorName, s.email, sp.officeDetails, sp.consultationDetails AS consultationDetails FROM tbl_counselornotes AS cn INNER JOIN tbl_staffaccounts AS s ON cn.staffAccount_ID = s.staffAccount_ID INNER JOIN tbl_staffprofiles as sp WHERE cn.studentAssessment_ID = ? LIMIT 1;';

                // Execute all queries in parallel
                Promise.all([
                    new Promise((resolve, reject) => {
                        db.query(fetchStudentProfile, [assessmentProfile_ID], (err, assessmentProfileResult) =>{
                            if (err) reject(err);
                            else resolve(assessmentProfileResult);
                        });
                    }),
                    new Promise((resolve, reject) => {
                        db.query(fetchRIASEC, [riasecResult_ID], (err, riasecResult) => {
                            if (err) reject(err);
                            else resolve(riasecResult);
                        });
                    }),
                    new Promise((resolve, reject) => {
                        db.query(fetchBigFive, [bigFiveResult_ID], (err, bigFiveResult) => {
                            if (err) reject(err);
                            else resolve(bigFiveResult);
                        });
                    }),
                    new Promise((resolve, reject) => {
                        db.query(fetchProgramRecoDetails, [assessmentID], (err, programRecos) => {
                            if (err) reject(err);
                            else resolve(programRecos);
                        });
                    }),
                    new Promise((resolve, reject) => {
                        db.query(fetchCounselorNotes, [assessmentID], (err, counselorNotes) => {
                            if (err) reject(err);
                            else resolve(counselorNotes);
                        });
                    })
                ]).then(async ([assessmentProfileResults ,riasecResults, bigFiveResults, programRecos, counselorNotes]) => {
                    
                    // Convert all results to proper JSON format
                    const responseData = {
                        success: true,
                        data: {
                            assessmentID: assessmentID,
                            assessmentProfile: assessmentProfileResults.length > 0 ? JSON.parse(JSON.stringify(assessmentProfileResults[0])) : null,
                            riasec: riasecResults.length > 0 ? JSON.parse(JSON.stringify(riasecResults[0])) : null,
                            bigFive: bigFiveResults.length > 0 ? JSON.parse(JSON.stringify(bigFiveResults[0])) : null,
                            programRecommendations: {
                                track_aligned: [],
                                cross_track: []
                            },
                            rating: result[0].rating || null,
                            feedback: result[0].feedback || null,
                            counselorNotes: counselorNotes.length > 0 ? JSON.parse(JSON.stringify(counselorNotes[0])) : null
                        }
                    };

                    // If there are program recommendations, fetch their details
                    if (programRecos.length > 0) {
                        const programPromises = programRecos.map(reco => {
                            return new Promise((resolve, reject) => {
                                // Use JOIN to fetch program and college data in one query
                                const fetchProgramWithCollege = `
                                    SELECT 
                                        p.*, 
                                        c.collegeName,
                                        c.collegeUSTlink
                                    FROM tbl_programs p 
                                    LEFT JOIN tbl_colleges c ON p.collegeID = c.collegeID 
                                    WHERE p.program_ID = ?`;
                                
                                db.query(fetchProgramWithCollege, [reco.program_ID], (err, results) => {
                                    if (err) {
                                        reject(err);
                                        return;
                                    }

                                    if (results.length === 0) {
                                        resolve({
                                            recommendation: JSON.parse(JSON.stringify(reco)),
                                            programDetails: null,
                                            collegeDetails: null
                                        });
                                        return;
                                    }

                                    const resultData = JSON.parse(JSON.stringify(results[0]));
                                    
                                    // Separate program details and college details
                                    const { collegeName, ...programDetails } = resultData;
                                    
                                    resolve({
                                        recommendation: JSON.parse(JSON.stringify(reco)),
                                        programDetails: programDetails,
                                        collegeDetails: collegeName ? { collegeName, collegeUSTlink: resultData.collegeUSTlink } : null
                                    });
                                });
                            });
                        });

                        try {
                            const programResults = await Promise.all(programPromises);
                            
                            // Separate programs into track_aligned and cross_track
                            programResults.forEach(program => {
                                const programWithScore = {
                                    ...program,
                                    alignment_score: parseFloat(program.recommendation.alignment_score) || 0
                                };
                                
                                if (program.recommendation.track_aligned === 'Y') {
                                    responseData.data.programRecommendations.track_aligned.push(programWithScore);
                                } else {
                                    responseData.data.programRecommendations.cross_track.push(programWithScore);
                                }
                            });

                            // Sort both arrays by alignment_score descending
                            responseData.data.programRecommendations.track_aligned.sort((a, b) => b.alignment_score - a.alignment_score);
                            responseData.data.programRecommendations.cross_track.sort((a, b) => b.alignment_score - a.alignment_score);

                        } catch (error) {
                            return res.json({ success: false, message: error.message });
                        }
                    }

                    return res.json(responseData);

                }).catch(error => {
                    return res.json({ success: false, message: error.message });
                });

            });
        } catch (e) {
            return res.json({ success: false, message: e.message });
        }
    });

    router.get('/assessment/history', (req, res) => {
        try {
            const { studentID } = req.query;

            if (!studentID) {
                return res.json({ success: false, message: 'Student ID is required' });
            }

            const fetchAssessmentHistory = `
                SELECT 
                    sa.studentAssessment_ID as assessmentId,
                    sa.date as date,
                    sa.rating as satisfaction,
                    sa.feedback as feedback,
                    cn.counselorNotes as counselorNotes,
                    cn.date as noteDate,
                    cn.staffAccount_ID as staffId,
                    s.name as counselorName,
                    s.email as counselorEmail
                FROM tbl_studentassessments sa
                LEFT JOIN tbl_counselornotes cn ON sa.studentAssessment_ID = cn.studentAssessment_ID
                LEFT JOIN tbl_staffaccounts s ON cn.staffAccount_ID = s.staffAccount_ID
                WHERE sa.studentAccount_ID = ?
                ORDER BY sa.date DESC
            `;

            db.query(fetchAssessmentHistory, [studentID], (err, results) => {
                if (err) {
                    return res.status(500).json({ success: false, message: err.message });
                }

                // Format the data for frontend
                const formattedAssessments = results.map(assessment => {
                    const assessmentDate = new Date(assessment.date);
                    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    
                    // Determine if there's a counselor reply
                    const hasCounselorReply = assessment.counselorName && assessment.counselorNotes;
                    
                    return {
                        assessmentId: assessment.assessmentId,
                        date: assessmentDate.toLocaleDateString('en-US'),
                        day: dayNames[assessmentDate.getDay()],
                        status: 'Completed', // Assuming all are completed since they're in history
                        satisfaction: assessment.satisfaction || 0,
                        feedback: assessment.feedback || '',
                        reply: hasCounselorReply ? {
                            counselor: assessment.counselorName,
                            date: assessment.noteDate ? new Date(assessment.noteDate).toLocaleDateString('en-US') : 'No date',
                            notes: assessment.counselorNotes,
                            isNew: false // You can add logic to determine if it's new based on dates
                        } : "No reply"
                    };
                });

                // Calculate stats
                const totalAssessments = results.length;
                const avgSatisfaction = results.length > 0 
                    ? (results.reduce((sum, a) => sum + (a.satisfaction || 0), 0) / results.length).toFixed(1)
                    : 0;
                const counselorReplies = results.filter(a => a.counselorName && a.counselorNotes).length;

                return res.status(200).json({
                    success: true,
                    data: {
                        stats: {
                            totalAssessments,
                            avgSatisfaction: parseFloat(avgSatisfaction),
                            counselorReplies
                        },
                        assessments: formattedAssessments
                    }
                });
            });

        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    });
    
    router.get('/assessment/getHomeAnalytics', (req, res) => {
        try {
            const { studentAccountId } = req.query;

            if (!studentAccountId) {
                return res.status(400).json({ error: 'studentAccountId is required' });
            }

            const query = `
                SELECT 
                    -- Total number of assessments completed
                    COUNT(*) as totalAssessments,
                    
                    -- Average engagement (records with rating not null divided by total assessments)
                    (COUNT(CASE WHEN rating IS NOT NULL THEN 1 END) * 100.0 / COUNT(*)) as averageEngagement,
                    
                    -- Average satisfaction (sum of ratings divided by number of ratings)
                    AVG(CASE WHEN rating IS NOT NULL THEN rating END) as averageSatisfaction,
                    
                    -- Additional useful metrics
                    COUNT(CASE WHEN rating IS NOT NULL THEN 1 END) as ratedAssessments,
                    COUNT(CASE WHEN rating IS NULL THEN 1 END) as unratedAssessments,
                    MAX(rating) as highestRating,
                    MIN(CASE WHEN rating IS NOT NULL THEN rating END) as lowestRating
                FROM tbl_studentassessments 
                WHERE studentAccount_ID = ?
            `;

            db.query(query, [studentAccountId], (error, results) => {
                if (error) {
                    console.error('Database error:', error);
                    return res.status(500).json({ error: 'Database error' });
                }

                if (!results.length) {
                    return res.status(404).json({ error: 'No assessment data found' });
                }

                const analytics = results[0];

                const recentAssessmentData = `
                SELECT
                    sa.studentAssessment_ID,
                    sa.date,

                    /* top 3 RIASEC traits as JSON (requires MySQL 8+ for JSON_ARRAYAGG ORDER BY) */
                    ( SELECT JSON_ARRAYAGG(JSON_OBJECT('trait', t.trait, 'value', t.value))
                        FROM (
                        SELECT trait, value FROM (
                            SELECT 'Realistic'      AS trait, r.realistic      AS value UNION ALL
                            SELECT 'Investigative'  AS trait, r.investigative  AS value UNION ALL
                            SELECT 'Artistic'       AS trait, r.artistic       AS value UNION ALL
                            SELECT 'Social'         AS trait, r.social         AS value UNION ALL
                            SELECT 'Enterprising'   AS trait, r.enterprising   AS value UNION ALL
                            SELECT 'Conventional'   AS trait, r.conventional   AS value
                        ) as unpvt
                        ORDER BY value DESC
                        LIMIT 3
                        ) AS t
                    ) AS riasec_top3,

                    /* top 3 Big Five traits as JSON */
                    ( SELECT JSON_ARRAYAGG(JSON_OBJECT('trait', t.trait, 'value', t.value))
                        FROM (
                        SELECT trait, value FROM (
                            SELECT 'Openness'          AS trait, b.openness         AS value UNION ALL
                            SELECT 'Conscientiousness' AS trait, b.conscientiousness AS value UNION ALL
                            SELECT 'Extraversion'      AS trait, b.extraversion      AS value UNION ALL
                            SELECT 'Agreeableness'     AS trait, b.agreeableness     AS value UNION ALL
                            SELECT 'Neuroticism'       AS trait, b.neuroticism       AS value
                        ) as unpvt
                        ORDER BY value DESC
                        LIMIT 3
                        ) AS t
                    ) AS bigfive_top3,

                    /* top 3 recommended programs (program name, college name, description, alignment score) as JSON array */
                    ( SELECT JSON_ARRAYAGG(JSON_OBJECT(
                            'programName', x.programName,
                            'collegeName',  x.collegeName,
                            'description',  x.programDescription,
                            'alignmentScore', x.alignmentScore
                        ))
                        FROM (
                        SELECT p.programName, c.collegeName, p.programDescription, rec.alignmentScore
                        FROM tbl_recommendations rec
                        JOIN tbl_programs p ON rec.program_ID = p.program_ID
                        LEFT JOIN tbl_colleges c ON p.collegeID = c.collegeID
                        WHERE rec.studentAssessment_ID = sa.studentAssessment_ID
                        AND rec.track_aligned = 'Y'
                        ORDER BY rec.alignmentScore DESC
                        LIMIT 3
                        ) AS x
                    ) AS top_programs

                    FROM tbl_studentassessments sa
                    LEFT JOIN tbl_riasecresults r ON sa.riasecResult_ID = r.riasecResult_ID
                    LEFT JOIN tbl_bigfiveresults b ON sa.bigFiveResult_ID = b.bigFiveResult_ID
                    WHERE sa.studentAccount_ID = ?
                    ORDER BY sa.date DESC
                    LIMIT 1`;
                
                db.query(recentAssessmentData, [studentAccountId], (error, recentResults) => {
                    if (error) {
                        console.error('Database error fetching recent assessment data:', error);
                        return res.status(500).json({ error: 'Database error' });
                    }
                    if (recentResults.length > 0) {
                        analytics.recentAssessmentData = recentResults[0];
                    }
                    const response = {
                        totalAssessments: analytics.totalAssessments || 0,
                        averageEngagement: analytics.averageEngagement ? Math.round(analytics.averageEngagement) : 0,
                        averageSatisfaction: analytics.averageSatisfaction ? Math.round(analytics.averageSatisfaction * 10) / 10 : 0, // Round to 1 decimal
                        ratedAssessments: analytics.ratedAssessments || 0,
                        unratedAssessments: analytics.unratedAssessments || 0,
                        highestRating: analytics.highestRating || 0,
                        lowestRating: analytics.lowestRating || 0,
                        recentAssessmentData: analytics.recentAssessmentData || null
                    };

                    res.json(response);
                });
                
                
                // Format the response
                
            });

        } catch (error) {
            console.error('Error fetching home analytics:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    router.post('/assessment/submitRating', (req, res) => {
        try {
            const { assessmentId, rating, feedback } = req.body;

            const updateQuery = `
                UPDATE tbl_studentassessments 
                SET rating = ?, feedback = ? 
                WHERE studentAssessment_ID = ?
            `
            db.query(updateQuery, [rating, feedback, assessmentId], (err) => {
                if (err) {
                    console.error('Error updating rating and feedback:', err);
                    return res.status(500).json({ success: false, message: 'Database error' });
                }
                return res.json({ success: true, message: 'Rating and feedback submitted successfully' });
            });

        } catch (error) {
            console.error('Error submitting rating and feedback:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    });

    router.post('/assessment/post-PendingAssessment', (req, res) => {
        try {
            const {
            studentAccount_ID,
            assessmentID,
            riasec_responses,
            riasec_progress,
            bigfive_responses,
            bigfive_progress
            } = req.body;

            // Validate required fields
            if (!studentAccount_ID) {
            return res.status(400).json({
                success: false,
                message: 'Student account ID is required'
            });
            }

            // Check if a pending assessment already exists for this student
            const checkQuery = `
            SELECT pendingAssessment_ID, assessmentProfile_ID 
            FROM tbl_pendingassessments 
            WHERE studentAccount_ID = ?
            ORDER BY created_at DESC 
            LIMIT 1
            `;

            db.query(checkQuery, [studentAccount_ID], (checkError, checkResults) => {
            if (checkError) {
                console.error('Database error:', checkError);
                return res.status(500).json({
                success: false,
                message: 'Database error occurred',
                error: checkError.message
                });
            }

            // If pending assessment exists, update it; otherwise, insert new record
            if (checkResults.length > 0) {
                // UPDATE existing record
                const pendingAssessmentId = checkResults[0].pendingAssessment_ID;
                const assessmentProfile_ID = checkResults[0].assessmentProfile_ID;
                
                const updateQuery = `
                UPDATE tbl_pendingassessments 
                SET 
                    assessmentProfile_ID = ?,
                    riasec_responses = ?,
                    riasec_progress = ?,
                    bigfive_responses = ?,
                    bigfive_progress = ?,
                    last_Updated = NOW()
                WHERE pendingAssessment_ID = ?
                `;

                const updateValues = [
                assessmentProfile_ID || null,
                JSON.stringify(riasec_responses),
                riasec_progress || 0,
                bigfive_responses ? JSON.stringify(bigfive_responses) : null,
                bigfive_progress || 0,
                pendingAssessmentId
                ];

                db.query(updateQuery, updateValues, (updateError) => {
                if (updateError) {
                    console.error('Update error:', updateError);
                    return res.status(500).json({
                    success: false,
                    message: 'Failed to update assessment progress',
                    error: updateError.message
                    });
                }

                    return res.status(200).json({
                        success: true,
                        message: 'Assessment progress updated successfully',
                    });
                });

            } else {
                // INSERT new record
                const pendingAssessmentId = assessmentID;

                const fetchAssessmentProfile =  `
                SELECT str.strand_ID, sap.gradeLevel, stg.mathGrade, stg.scienceGrade, stg.englishGrade, stg.genAverageGrade
                FROM tbl_studentprofiles AS sap
                LEFT JOIN tbl_strands AS str ON sap.strand_ID = str.strand_ID
                LEFT JOIN tbl_studentgrades AS stg ON sap.studentGrades_ID = stg.studentGrades_ID
                LEFT JOIN tbl_studentaccounts AS sa ON sap.studentProfile_ID = sa.studentProfile_ID
                WHERE sa.studentAccount_ID = ?
                LIMIT 1
                `;
                db.query(fetchAssessmentProfile, [studentAccount_ID], (profileError, profileResults) => {
                    if (profileError) {
                        console.error('Profile fetch error:', profileError);
                        return res.status(500).json({
                        success: false,
                        message: 'Failed to fetch student profile',
                        error: profileError.message
                        });
                    }

                    const insertAssessmentProfile = `INSERT INTO tbl_assessmentprofiles 
                    (strand_ID, gradeLevel, mathGrade, scienceGrade, englishGrade, genAverageGrade) 
                    VALUES (?, ?, ?, ?, ?, ?)`;

                    const profileDetails = profileResults[0];
                    
                    db.query(insertAssessmentProfile, 
                    [
                        profileDetails.strand_ID,
                        profileDetails.gradeLevel,
                        profileDetails.mathGrade,
                        profileDetails.scienceGrade,
                        profileDetails.englishGrade,
                        profileDetails.genAverageGrade
                    ], (insertProfileError, insertProfileResults) => {
                        if (insertProfileError) {  
                            console.error('Insert profile error:', insertProfileError);
                            return res.status(500).json({
                            success: false,
                            message: 'Failed to create assessment profile',
                            error: insertProfileError.message
                            });
                        }

                        const assessmentProfile_ID = insertProfileResults.insertId;

                        const insertQuery = `
                        INSERT INTO tbl_pendingassessments (
                            pendingAssessment_ID,
                            studentAccount_ID,
                            assessmentProfile_ID,
                            riasec_responses,
                            riasec_progress,
                            bigfive_responses,
                            bigfive_progress,
                            last_Updated,
                            created_At
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `;

                        const last_Updated = new Date();
                        const created_At = new Date();

                        const insertValues = [
                            pendingAssessmentId,
                            studentAccount_ID,
                            assessmentProfile_ID || null,
                            JSON.stringify(riasec_responses),
                            riasec_progress || 0,
                            bigfive_responses ? JSON.stringify(bigfive_responses) : null,
                            bigfive_progress || 0,
                            last_Updated,
                            created_At
                        ];

                        db.query(insertQuery, insertValues, (insertError) => {
                            if (insertError) {
                                console.error('Insert error:', insertError);
                                return res.status(500).json({
                                success: false,
                                message: 'Failed to save assessment progress',
                                error: insertError.message
                                });
                            }

                            return res.status(201).json({
                                success: true,
                                message: 'Assessment progress saved successfully',
                            });
                        });
                    });
                });
            }
            });

        } catch (error) {
            console.error('Server error:', error);
            return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
            });
        }
    });

    router.get('/assessment/get-PendingAssessment', (req, res) => {
        const { studentAccountId } = req.query;

        if (!studentAccountId) {
            return res.status(400).json({
            success: false,
            message: 'studentAccountId is required'
            });
        }

        const query = `
            SELECT
            pa.pendingAssessment_ID, 
            pa.riasec_responses,
            pa.riasec_progress,
            pa.bigfive_responses,
            pa.bigfive_progress,
            pa.last_Updated,
            pa.created_at,
            str.strandName,
            sap.gradeLevel,
            sap.mathGrade,
            sap.scienceGrade,
            sap.englishGrade,
            sap.genAverageGrade
            FROM tbl_pendingassessments AS pa
            LEFT JOIN tbl_assessmentprofiles AS sap ON pa.assessmentProfile_ID = sap.assessmentProfile_ID
            LEFT JOIN tbl_strands AS str ON sap.strand_ID = str.strand_ID
            WHERE pa.studentAccount_ID = ?
            ORDER BY pa.created_at DESC
            LIMIT 1
        `;

        db.query(query, [studentAccountId], (error, results) => {
            if (error) {
            console.error('Database error:', error);
            return res.status(500).json({
                success: false,
                message: 'Database error occurred',
                error: error.message
            });
            }

            if (results.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No saved progress found'
            });
            }

            // Parse JSON fields
            const progress = results[0];
            progress.riasec_responses = progress.riasec_responses ? 
            progress.riasec_responses : null;
            progress.bigfive_responses = progress.bigfive_responses ? 
            progress.bigfive_responses : null;

            return res.status(200).json({
                success: true,
                data: progress
            });
        });
    });

    router.delete('/assessment/delete-PendingAssessment/', (req, res) => {
        const { pendingAssessment_ID, studentAccount_ID } = req.body;

        const query = 'DELETE FROM tbl_pendingassessments WHERE pendingAssessment_ID = ? AND studentAccount_ID = ?';

        db.query(query, [pendingAssessment_ID, studentAccount_ID], (error, results) => {
            if (error) {
            console.error('Database error:', error);
            return res.status(500).json({
                success: false,
                message: 'Database error occurred',
                error: error.message
            });
            }

            if (results.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Progress record not found'
            });
            }

            return res.status(200).json({
            success: true,
            message: 'Assessment progress deleted successfully'
            });
        });
    });

    // GET all counselor notes for an assessment
    router.get('/assessment/:id/notes', (req, res) => {
        try {
            const assessmentId = req.params.id;
            if (!assessmentId) return res.status(400).json({ success: false, message: 'assessment id required' });

            const sql = `
                SELECT cn.counselorNote_ID, cn.studentAssessment_ID, cn.staffAccount_ID, cn.counselorNotes, cn.date, cn.edited_date,
                       cn.reassignedToStaffAccount_ID, cn.reassigned_date, s.name AS counselorName, s.email AS counselorEmail,
                       s2.name AS reassignedToName, s2.email AS reassignedToEmail
                FROM tbl_counselornotes cn
                LEFT JOIN tbl_staffaccounts s ON cn.staffAccount_ID = s.staffAccount_ID
                LEFT JOIN tbl_staffaccounts s2 ON cn.reassignedToStaffAccount_ID = s2.staffAccount_ID
                WHERE cn.studentAssessment_ID = ?
                ORDER BY cn.date ASC
            `;

            db.query(sql, [assessmentId], (err, rows) => {
                if (err) return res.status(500).json({ success: false, message: err.message });
                return res.json({ success: true, data: rows || [] });
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    });

    // NOTE: POST for creating counselor notes moved to admin routes (adminassessmentRoutes.js)

    return router;
};

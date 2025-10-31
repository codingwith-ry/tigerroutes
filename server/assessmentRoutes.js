const express = require('express');
const { resolvePath } = require('react-router-dom');

module.exports = (db) => {
    const router = express.Router();

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
            FROM tbl_studentAccounts sa
            LEFT JOIN tbl_studentProfiles sp ON sa.studentProfile_ID = sp.studentProfile_ID
            LEFT JOIN tbl_strands strands ON sp.strand_ID = strands.strand_ID
            LEFT JOIN tbl_studentGrades sg ON sp.studentGrades_ID = sg.studentGrades_ID
            WHERE sa.studentAccount_ID = ?
            `;

            // Using db.query with promise wrapper
            db.query(query, [studentAccountId], (error, results) => {
                if (error) {
                    console.error('Database error:', error);
                    return res.status(500).json({ error: 'Database error' });
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

                res.json(userData);
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

        const studentProfileQuery = `INSERT INTO tbl_assessmentProfiles (mathGrade, scienceGrade, englishGrade, genAverageGrade, strand_ID, gradeLevel) VALUES (?, ?, ?, ?, ?, ?)`;
        

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
                                                timestamp = new Date()
                                            ],
                                            async (err, assessmentResult) => {
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

    router.get('/assessment/assessmentDetails', (req, res) => {
        try {
            const { assessmentID } = req.query;

            if (!assessmentID) {
                return res.json({ success: false, message: 'assessmentID is required' });
            }

            const fetchPsychometricIDs = 'SELECT assessmentProfile_ID, studentAccount_ID, riasecResult_ID, bigFiveResult_ID FROM tbl_studentassessments WHERE studentAssessment_ID = ? LIMIT 1';

            db.query(fetchPsychometricIDs, [assessmentID], (err, result) => {
                if (err) {
                    return res.json({ success: false, message: err.message });
                }

                if (result.length === 0) {
                    return res.json({ success: false, message: 'Assessment not found' });
                }

                const { assessmentProfile_ID, riasecResult_ID, bigFiveResult_ID } = result[0];

                // Fetch Student Profile
                const fetchStudentProfile = 'SELECT st.`name`, st.email, ap.gradeLevel, s.strandName, ap.mathGrade, ap.scienceGrade, ap.englishGrade, ap.genAverageGrade, sa.date FROM tbl_assessmentProfiles AS ap INNER JOIN tbl_strands AS s ON ap.strand_ID = s.strand_ID INNER JOIN tbl_studentassessments AS sa ON ap.assessmentProfile_ID = sa.assessmentProfile_ID INNER JOIN tbl_studentaccounts AS st ON sa.studentAccount_ID = st.studentAccount_ID WHERE ap.assessmentProfile_ID = ?';

                // Fetch RIASEC results
                const fetchRIASEC = 'SELECT * FROM tbl_riasecresults WHERE riasecResult_ID = ?';
                
                // Fetch Big Five results
                const fetchBigFive = 'SELECT * FROM tbl_bigfiveresults WHERE bigFiveResult_ID = ?';

                // Fetch program recommendations
                const fetchProgramRecoDetails = 'SELECT * FROM tbl_recommendations WHERE studentAssessment_ID = ?';

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
                    })
                ]).then(async ([assessmentProfileResults ,riasecResults, bigFiveResults, programRecos]) => {
                    
                    // Convert all results to proper JSON format
                    const responseData = {
                        success: true,
                        data: {
                            assessmentProfile: assessmentProfileResults.length > 0 ? JSON.parse(JSON.stringify(assessmentProfileResults[0])) : null,
                            riasec: riasecResults.length > 0 ? JSON.parse(JSON.stringify(riasecResults[0])) : null,
                            bigFive: bigFiveResults.length > 0 ? JSON.parse(JSON.stringify(bigFiveResults[0])) : null,
                            programRecommendations: {
                                track_aligned: [],
                                cross_track: []
                            }
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
                                        c.collegeName 
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
                                        collegeDetails: collegeName ? { collegeName } : null
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
                    return res.json({ success: false, message: err.message });
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

                res.json({
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
            return res.json({ success: false, message: error.message });
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
                
                // Format the response
                const response = {
                    totalAssessments: analytics.totalAssessments || 0,
                    averageEngagement: analytics.averageEngagement ? Math.round(analytics.averageEngagement) : 0,
                    averageSatisfaction: analytics.averageSatisfaction ? Math.round(analytics.averageSatisfaction * 10) / 10 : 0, // Round to 1 decimal
                    ratedAssessments: analytics.ratedAssessments || 0,
                    unratedAssessments: analytics.unratedAssessments || 0,
                    highestRating: analytics.highestRating || 0,
                    lowestRating: analytics.lowestRating || 0
                };

                res.json(response);
            });

        } catch (error) {
            console.error('Error fetching home analytics:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    router.post('/assessment/submitRating', (req, res) => {
        try {
            const { assessmentId, rating, feedback } = req.body;
            if (!assessmentId) {
                return res.status(400).json({ success: false, message: 'assessmentID is required' });
            }

            const updateQuery = `
                UPDATE tbl_studentassessments 
                SET rating = ?, feedback = ? 
                WHERE studentAssessment_ID = ?
            `
            db.query(updateQuery, [rating, feedback, assessmentId], (err, result) => {
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


    return router;
};

const express = require('express');

module.exports = (db) => {
    const router = express.Router();

    router.get('/assessment/getStrands', (req, res) => {
        const query = `SELECT * FROM tbl_strands`;
        db.query(query, (err, results) => {
            if (err) {
                console.error('Error fetching strands:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }
            res.json(results);
        });
    });

    router.post('/assessment/complete', (req, res) => {
        console.log("Assessment completion endpoint hit");
        const { studentAssessment_ID, studentAccount_ID, riasecResults, bigFiveResults } = req.body;

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

                        const assessmentQuery = `INSERT INTO tbl_studentassessments (studentAssessment_ID, studentAccount_ID, riasecResult_ID, bigFiveResult_ID, date) VALUES(?, ?, ?, ?, ?)`;
                        db.query(
                            assessmentQuery,
                            [
                                studentAssessment_ID,
                                studentAccount_ID,
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
            }
        );
    });

    router.get('/assessment/assessmentDetails', (req, res) => {
        try {
            const { assessmentID } = req.query;

            if (!assessmentID) {
                return res.json({ success: false, message: 'assessmentID is required' });
            }

            const fetchPsychometricIDs = 'SELECT riasecResult_ID, bigFiveResult_ID FROM tbl_studentassessments WHERE studentAssessment_ID = ? LIMIT 1';

            db.query(fetchPsychometricIDs, [assessmentID], (err, result) => {
                if (err) {
                    return res.json({ success: false, message: err.message });
                }

                if (result.length === 0) {
                    return res.json({ success: false, message: 'Assessment not found' });
                }

                const { riasecResult_ID, bigFiveResult_ID } = result[0];

                // Fetch RIASEC results
                const fetchRIASEC = 'SELECT * FROM tbl_riasecresults WHERE riasecResult_ID = ?';
                
                // Fetch Big Five results
                const fetchBigFive = 'SELECT * FROM tbl_bigfiveresults WHERE bigFiveResult_ID = ?';

                // Fetch program recommendations
                const fetchProgramRecoDetails = 'SELECT * FROM tbl_recommendations WHERE studentAssessment_ID = ?';

                // Execute all queries in parallel
                Promise.all([
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
                ]).then(async ([riasecResults, bigFiveResults, programRecos]) => {
                    
                    // Convert all results to proper JSON format
                    const responseData = {
                        success: true,
                        data: {
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
    return router;
};

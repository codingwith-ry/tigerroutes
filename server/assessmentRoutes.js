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

    router.get('/assessment/assessmentDetails', (req, res)=>{
        try{
            const {assessmentID} = req.body;

            const fetchPsychometricIDs = 'SELECT riasecResult_ID, bigFiveResult_ID FROM tbl_studentassessments WHERE studentAssessment_ID = ? LIMIT 1';

            db.query([fetchPsychometricIDs, assessmentID], (err, result)=>{

                const fetchRIASEC = 'SELECT * from tbl_riasecresults WHERE riasecResult_ID = ?';

                const fetchBigFive = 'SELECT * from tbl_bigfiveresults WHERE bigFiveResult_ID = ?';

                const fetchProgramRecoDetails = 'SELECT * from tbl_recommendations WHERE studentAssessment_ID = ?';

                const fetchProgramDescriptions = 'SELECT * from tbl_programs WHERE program_ID = ?';

            });
            
        }catch(e){
            return res.json({success: false, message: e.message});
        }
    });
    return router;
};

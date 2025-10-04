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

                                const programsRequest = await fetch('http://localhost:8000/score', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        riasec: riasecResults,
                                        bigfive: bigFiveResults
                                    })
                                }).then(response => {
                                    console.log("Scoring Engine Response:", response.json());

                                    return res.status(200).json({
                                        success: true,
                                        message: 'Assessment results saved successfully',
                                        programRecommendations: response.json()
                                    });
                                })
                                .catch(error => {
                                    console.error('Error fetching program recommendations:', error);
                                    return res.status(500).json({ message: 'Error fetching program recommendations' });
                                });   
                        });

                        
                    }
                );
            }
        );
    });
    return router;
};

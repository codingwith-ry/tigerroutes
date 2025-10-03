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
        const { studentAccount_ID, riasecResults, bigFiveResults } = req.body;

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

                        res.status(200).json({
                            success: true,
                            riasecInsertId: riasecResult.insertId,
                            bigFiveInsertId: bigFiveResult.insertId,
                            message: 'Assessment results saved successfully'
                        });
                    }
                );
            }
        );
    });

    return router;
};

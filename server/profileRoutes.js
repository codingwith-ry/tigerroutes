//This file is where we keep all login/register API routes
const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');

module.exports = (db) => {
    const router = express.Router();

    router.get('/strands', (req, res) => {
        db.query('SELECT * FROM tbl_strands', (err, results) => {
            if (err) return res.status(500).json({ error: err.message});
            res.json(results);
        });
    });

    router.get('/student/:id', (req, res) => {
        const id = req.params.id;
        db.query('SELECT * FROM tbl_studentaccounts WHERE studentAccount_ID', [id], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            if (results.length > 0) {
                res.json(results[0]);
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        })
    })

    router.put('/student/:id', (req, res) => {
        const { id } = req.params.id;
        // const { firstName, lastName } = req.body;
        // const fullName = firstName + ' ' + lastName;
        db.query(
            'UPDATE tbl_studentaccounts SET name = ? WHERE studentAccount_ID = ?', [id], (err, results) => {
                [fullName, id],
                (err, result) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ success: true });
                }
            }
        );
    });

    router.put('/student-profile/:id', (req, res) => {
        const studentAccountId = req.params.id;
        const { firstName, lastName, strand_ID, gradeLevel } = req.body;

        // Start transaction to ensure data consistency
        db.beginTransaction((err) => {
            if (err) return res.status(500).json({ error: err.message });

            // First, update the student's name
            const fullName = firstName + ' ' + lastName;
            db.query(
                'UPDATE tbl_studentaccounts SET name = ? WHERE studentAccount_ID = ?',
                [fullName, studentAccountId],
                (err, result) => {
                    if (err) {
                        return db.rollback(() => {
                            res.status(500).json({ error: err.message });
                        });
                    }

                    // Check if student already has a linked profile
                    db.query(
                        'SELECT studentProfile_ID FROM tbl_studentaccounts WHERE studentAccount_ID = ?',
                        [studentAccountId],
                        (err, results) => {
                            if (err) {
                                return db.rollback(() => {
                                    res.status(500).json({ error: err.message });
                                });
                            }

                            const existingProfileId = results[0]?.studentProfile_ID;

                            if (existingProfileId) {
                                // Profile exists - UPDATE the existing one
                                db.query(
                                    'UPDATE tbl_studentprofiles SET strand_ID = ?, gradeLevel = ? WHERE studentProfile_ID = ?',
                                    [strand_ID, gradeLevel, existingProfileId],
                                    (err, result) => {
                                        if (err) {
                                            return db.rollback(() => {
                                                res.status(500).json({ error: err.message });
                                            });
                                        }
                                        
                                        db.commit((err) => {
                                            if (err) {
                                                return db.rollback(() => {
                                                    res.status(500).json({ error: err.message });
                                                });
                                            }
                                            res.json({ 
                                                success: true, 
                                                message: 'Profile updated successfully',
                                                profileId: existingProfileId 
                                            });
                                        });
                                    }
                                );
                            } else {
                                // No profile exists - CREATE a new one and LINK it
                                db.query(
                                    'INSERT INTO tbl_studentprofiles (strand_ID, gradeLevel) VALUES (?, ?)',
                                    [strand_ID, gradeLevel],
                                    (err, result) => {
                                        if (err) {
                                            return db.rollback(() => {
                                                res.status(500).json({ error: err.message });
                                            });
                                        }

                                        const newProfileId = result.insertId;

                                        // Link the new profile to the student account
                                        db.query(
                                            'UPDATE tbl_studentaccounts SET studentProfile_ID = ? WHERE studentAccount_ID = ?',
                                            [newProfileId, studentAccountId],
                                            (err, result) => {
                                                if (err) {
                                                    return db.rollback(() => {
                                                        res.status(500).json({ error: err.message });
                                                    });
                                                }

                                                db.commit((err) => {
                                                    if (err) {
                                                        return db.rollback(() => {
                                                            res.status(500).json({ error: err.message });
                                                        });
                                                    }
                                                    res.json({ 
                                                        success: true, 
                                                        message: 'Profile created and linked successfully',
                                                        profileId: newProfileId 
                                                    });
                                                });
                                            }
                                        );
                                    }
                                );
                            }
                        }
                    );
                }
            );
        });
    });

    router.get('/student-profile/:id', (req, res) => {
        const id = req.params.id;
        db.query(`
            SELECT sa.studentAccount_ID, sa.name, sa.email, sp.studentProfile_ID, sp.strand_ID, sp.gradeLevel, s.strandName
            FROM tbl_studentaccounts sa
            LEFT JOIN tbl_studentprofiles sp ON sa.studentProfile_ID = sp.studentProfile_ID
            LEFT JOIN tbl_strands s ON sp.strand_ID = s.strand_ID
            WHERE sa.studentAccount_ID = ?`, [id], (err, results) => {
                if (err) return res.status(500).json({ error: err.message });
                if (results.length > 0) {
                    res.json(results[0]);
                } else {
                    res.status(404).json({ error: 'User not found' });
                }
            })
    });

    
    return router;
}
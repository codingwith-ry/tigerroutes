const express = require('express');
const requireJwt = require('./middleware/requireJwt');

module.exports = (db) => {
  const router = express.Router();
  // Require admin JWT for all admin assessment routes
  router.use(requireJwt);

  // GET /api/assessments
  // Returns paginated list of assessments with computed average alignment (track_aligned recommendations)
  router.get('/assessments', async (req, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page || '1', 10));
      const pageSize = Math.max(1, parseInt(req.query.pageSize || '10', 10));
      const q = (req.query.q || '').trim();
      const startDate = (req.query.startDate || '').trim();
      const endDate = (req.query.endDate || '').trim();
      const grade = (req.query.grade || '').trim();
      const offset = (page - 1) * pageSize;

      // Base FROM clause: assessments joined with student, profile, strand, and assessment profile info
      const baseFrom = `
        FROM tbl_studentassessments sa
        LEFT JOIN tbl_studentaccounts st ON sa.studentAccount_ID = st.studentAccount_ID
        LEFT JOIN tbl_studentprofiles sp ON st.studentProfile_ID = sp.studentProfile_ID
        LEFT JOIN tbl_strands s ON sp.strand_ID = s.strand_ID
        LEFT JOIN tbl_assessmentprofiles ap ON sa.assessmentProfile_ID = ap.assessmentProfile_ID
      `;

      // Build WHERE clauses and params
      const whereClauses = [];
      const whereParams = [];
      if (q) {
        whereClauses.push(`(sa.studentAssessment_ID LIKE ? OR st.name LIKE ? OR s.strandName LIKE ?)`);
        const like = `%${q}%`;
        whereParams.push(like, like, like);
      }
      if (startDate && endDate) {
        whereClauses.push(`DATE(sa.date) BETWEEN ? AND ?`);
        whereParams.push(startDate, endDate);
      } else if (startDate) {
        whereClauses.push(`DATE(sa.date) >= ?`);
        whereParams.push(startDate);
      } else if (endDate) {
        whereClauses.push(`DATE(sa.date) <= ?`);
        whereParams.push(endDate);
      }
      if (grade) {
        const g = parseInt(grade, 10);
        if (!Number.isNaN(g)) {
          whereClauses.push(`ap.gradeLevel = ?`);
          whereParams.push(g);
        }
      }

      // Data query
      let dataQuery = `SELECT sa.studentAssessment_ID AS assessmentId, sa.studentAccount_ID AS studentAccountId, sa.date, sa.rating, st.name AS studentName, s.strandName AS strand ${baseFrom}`;
      if (whereClauses.length > 0) dataQuery += ` WHERE ${whereClauses.join(' AND ')}`;
      dataQuery += ` ORDER BY sa.date DESC LIMIT ? OFFSET ?`;

      const dataParams = [...whereParams, pageSize, offset];
      const [rows] = await db.promise().query(dataQuery, dataParams);

      // Compute total count with same filters
      let total = 0;
      try {
        let countQuery = `SELECT COUNT(*) AS total ${baseFrom}`;
        if (whereClauses.length > 0) countQuery += ` WHERE ${whereClauses.join(' AND ')}`;
        const [countRows] = await db.promise().query(countQuery, whereParams);
        total = countRows && countRows[0] ? Number(countRows[0].total) : 0;
      } catch (countErr) {
        console.warn('Failed to compute total count for assessments:', countErr);
        total = rows ? rows.length : 0;
      }

      if (!rows || rows.length === 0) {
        return res.json({ success: true, data: [], total });
      }

      // compute average alignment for returned assessment IDs
      const ids = rows.map((r) => r.assessmentId);
      if (ids.length === 0) {
        return res.json({ success: true, data: [], total });
      }
      const placeholders = ids.map(() => '?').join(',');
      const recQuery = `SELECT studentAssessment_ID, AVG(alignmentScore) AS avgAlignment FROM tbl_recommendations WHERE track_aligned = 'Y' AND studentAssessment_ID IN (${placeholders}) GROUP BY studentAssessment_ID`;
      const [recRows] = await db.promise().query(recQuery, ids);

      const alignmentMap = {};
      (recRows || []).forEach((r) => {
        alignmentMap[r.studentAssessment_ID] = r.avgAlignment;
      });

      const data = rows.map((r) => ({
        assessmentId: r.assessmentId,
        studentAccountId: r.studentAccountId,
        studentName: r.studentName,
        date: r.date,
        rating: r.rating,
        strand: r.strand || 'N/A',
        alignment: alignmentMap[r.assessmentId] != null ? Number(alignmentMap[r.assessmentId]) : null,
      }));

      return res.json({ success: true, data, total });
    } catch (err) {
      console.error('Error fetching assessments:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  });

      // GET /api/assessment/:id/programs
      // Returns program recommendations (track-aligned and cross-track) with program details
      router.get('/assessment/:id/programs', async (req, res) => {
        try {
          const assessmentId = req.params.id;
          if (!assessmentId) return res.status(400).json({ success: false, message: 'assessment id required' });

          const sql = `
            SELECT r.recommendation_ID, r.program_ID, r.alignmentScore, r.breakdown, r.track_aligned,
                   p.programName, p.programDescription, p.careerPaths, p.collegeID,
                   c.collegeName
            FROM tbl_recommendations r
            LEFT JOIN tbl_programs p ON r.program_ID = p.program_ID
            LEFT JOIN tbl_colleges c ON p.collegeID = c.collegeID
            WHERE r.studentAssessment_ID = ?
          `;

          const [rows] = await db.promise().query(sql, [assessmentId]);

          const track_aligned = [];
          const cross_track = [];

          (rows || []).forEach((r) => {
            const item = {
              recommendationId: r.recommendation_ID,
              programId: r.program_ID,
              programName: r.programName,
              programDescription: r.programDescription || null,
              careerPaths: r.careerPaths ? (typeof r.careerPaths === 'string' ? JSON.parse(r.careerPaths) : r.careerPaths) : null,
              college: r.collegeName || null,
              alignment_score: r.alignmentScore != null ? Number(r.alignmentScore) : null,
              breakdown: r.breakdown ? (typeof r.breakdown === 'string' ? JSON.parse(r.breakdown) : r.breakdown) : null,
            };

            if (String(r.track_aligned).toUpperCase() === 'Y') track_aligned.push(item);
            else cross_track.push(item);
          });

          return res.json({ success: true, data: { track_aligned, cross_track } });
        } catch (err) {
          console.error('Error fetching program recommendations for assessment:', err);
          return res.status(500).json({ success: false, message: err.message });
        }
      });

      // POST /api/assessment/:id/notes
      // Create a new counselor note for an assessment (admin-only route)
      router.post('/assessment/:id/notes', async (req, res) => {
        try {
          const assessmentId = req.params.id;
          const { staffAccount_ID, counselorNotes } = req.body;
          if (!assessmentId || !staffAccount_ID || !counselorNotes) {
            return res.status(400).json({ success: false, message: 'assessment id, staffAccount_ID and counselorNotes are required' });
          }

          const insertSql = `INSERT INTO tbl_counselornotes (studentAssessment_ID, staffAccount_ID, counselorNotes, date) VALUES (?, ?, ?, NOW())`;
          const [result] = await db.promise().query(insertSql, [assessmentId, staffAccount_ID, counselorNotes]);

          // include note snippet in log (trim and remove newlines)
          const rawSnippet = (counselorNotes || '').toString().replace(/\s+/g, ' ').trim();
          const snippet = rawSnippet.length > 200 ? rawSnippet.slice(0, 200) + '...' : rawSnippet;

          // Log creation to tbl_stafflogs (store UTC and let clients render local time)
          try {
            const actionText = `Create counselor note for assessment id:${assessmentId} (noteId:${result.insertId}) - "${snippet}"`;
            await db.promise().query('INSERT INTO tbl_stafflogs (staffAccount_ID, action, date) VALUES (?, ?, UTC_TIMESTAMP())', [staffAccount_ID || null, actionText]);
          } catch (logErr) {
            console.warn('Failed to write staff log for create counselor note:', logErr);
          }

          return res.json({ success: true, data: { counselorNote_ID: result.insertId } });
        } catch (err) {
          console.error('Error inserting counselor note:', err);
          return res.status(500).json({ success: false, message: err.message });
        }
      });

      // DELETE /api/assessment/:id/notes/:noteId
      // Delete a counselor note only if the staffAccount_ID matches the note's owner
      router.delete('/assessment/:id/notes/:noteId', async (req, res) => {
        try {
          const assessmentId = req.params.id;
          const noteId = req.params.noteId;
          // staffAccount_ID may be supplied in query or body
          const staffAccount_ID = req.query.staffAccount_ID || req.body.staffAccount_ID;

          if (!assessmentId || !noteId || !staffAccount_ID) {
            return res.status(400).json({ success: false, message: 'assessment id, note id and staffAccount_ID are required' });
          }

          // Fetch the note content before deleting so we can include it in the log
          const [noteRows] = await db.promise().query('SELECT counselorNotes FROM tbl_counselornotes WHERE counselorNote_ID = ? AND studentAssessment_ID = ? AND staffAccount_ID = ?', [noteId, assessmentId, staffAccount_ID]);
          const noteContent = noteRows && noteRows[0] ? (noteRows[0].counselorNotes || '') : '';

          // Delete only when the note belongs to the staffAccount_ID provided
          const deleteSql = `DELETE FROM tbl_counselornotes WHERE counselorNote_ID = ? AND studentAssessment_ID = ? AND staffAccount_ID = ?`;
          const [result] = await db.promise().query(deleteSql, [noteId, assessmentId, staffAccount_ID]);

          if (result.affectedRows && result.affectedRows > 0) {
            // prepare snippet
            const rawSnippet = noteContent.toString().replace(/\s+/g, ' ').trim();
            const snippet = rawSnippet.length > 200 ? rawSnippet.slice(0, 200) + '...' : rawSnippet;

            // Log deletion to tbl_stafflogs (store UTC and let clients render local time)
            try {
              const actionText = `Delete counselor note (noteId:${noteId}) from assessment id:${assessmentId} - "${snippet}"`;
              await db.promise().query('INSERT INTO tbl_stafflogs (staffAccount_ID, action, date) VALUES (?, ?, UTC_TIMESTAMP())', [staffAccount_ID || null, actionText]);
            } catch (logErr) {
              console.warn('Failed to write staff log for delete counselor note:', logErr);
            }
            return res.json({ success: true, message: 'Note deleted' });
          }

          return res.status(403).json({ success: false, message: 'Not authorized to delete this note or note not found' });
        } catch (err) {
          console.error('Error deleting counselor note:', err);
          return res.status(500).json({ success: false, message: err.message });
        }
      });

      // PUT /api/assessment/:id/notes/:noteId
      // Edit a counselor note only if the staffAccount_ID matches the note's owner
      router.put('/assessment/:id/notes/:noteId', async (req, res) => {
        try {
          const assessmentId = req.params.id;
          const noteId = req.params.noteId;
          const { staffAccount_ID, counselorNotes } = req.body;

          if (!assessmentId || !noteId || !staffAccount_ID || typeof counselorNotes === 'undefined') {
            return res.status(400).json({ success: false, message: 'assessment id, note id, staffAccount_ID and counselorNotes are required' });
          }

          // Update only when the note belongs to the staffAccount_ID provided
          const updateSql = `UPDATE tbl_counselornotes SET counselorNotes = ?, edited_date = UTC_TIMESTAMP() WHERE counselorNote_ID = ? AND studentAssessment_ID = ? AND staffAccount_ID = ?`;
          const [updateResult] = await db.promise().query(updateSql, [counselorNotes, noteId, assessmentId, staffAccount_ID]);

          if (updateResult.affectedRows && updateResult.affectedRows > 0) {
            // Fetch the new edited_date to return to client
            const [rows] = await db.promise().query('SELECT edited_date FROM tbl_counselornotes WHERE counselorNote_ID = ?', [noteId]);
            const edited = rows && rows[0] ? rows[0].edited_date : null;

            // Log edit action
            try {
              const rawSnippet = (counselorNotes || '').toString().replace(/\s+/g, ' ').trim();
              const snippet = rawSnippet.length > 200 ? rawSnippet.slice(0, 200) + '...' : rawSnippet;
              const actionText = `Edit counselor note (noteId:${noteId}) on assessment id:${assessmentId} - "${snippet}"`;
              await db.promise().query('INSERT INTO tbl_stafflogs (staffAccount_ID, action, date) VALUES (?, ?, UTC_TIMESTAMP())', [staffAccount_ID || null, actionText]);
            } catch (logErr) {
              console.warn('Failed to write staff log for edit counselor note:', logErr);
            }

            return res.json({ success: true, data: { edited_date: edited } });
          }

          return res.status(403).json({ success: false, message: 'Not authorized to edit this note or note not found' });
        } catch (err) {
          console.error('Error editing counselor note:', err);
          return res.status(500).json({ success: false, message: err.message });
        }
      });
  // GET /api/admin/strand-analytics
  // Returns per-strand metrics: avgAlignment (avg of per-assessment avg alignment where track_aligned='Y'), assessments_count, avgSatisfaction
  router.get('/admin/strand-analytics', async (req, res) => {
    try {
      const startDate = (req.query.startDate || '').trim();
      const endDate = (req.query.endDate || '').trim();
      const grade = (req.query.grade || '').trim();

      // Build where clauses to apply to assessments (alias 'a') and assessment profiles (ap.gradeLevel)
      const whereClauses = [];
      const whereParams = [];
      if (startDate && endDate) {
        whereClauses.push(`DATE(a.date) BETWEEN ? AND ?`);
        whereParams.push(startDate, endDate);
      } else if (startDate) {
        whereClauses.push(`DATE(a.date) >= ?`);
        whereParams.push(startDate);
      } else if (endDate) {
        whereClauses.push(`DATE(a.date) <= ?`);
        whereParams.push(endDate);
      }
      if (grade) {
        const g = parseInt(grade, 10);
        if (!Number.isNaN(g)) {
          whereClauses.push(`ap.gradeLevel = ?`);
          whereParams.push(g);
        }
      }

      // Base numeric aggregation per strand
      // Use only the assessment profile's `strand_ID` to attribute assessments to strands.
      // Assessments without an assessment profile (ap) will be excluded from strand aggregates.
      let sql = `
        SELECT
          s.strand_ID,
          s.strandName,
          ROUND(AVG(pa.avgAlignment), 2) AS avgAlignment,
          COUNT(DISTINCT a_res.studentAssessment_ID) AS assessments_count,
          ROUND(AVG(a_res.rating), 2) AS avgSatisfaction
        FROM tbl_strands s

        /*
          Build a derived table of assessments where we resolve the strand for each
          assessment using COALESCE(ap.strand_ID, sp.strand_ID) as resolved_strand.
          This ensures we include assessments that are only attached to an assessment
          profile (ap) even when the student's profile (sp) is NULL.
        */
        LEFT JOIN (
          SELECT
            a.studentAssessment_ID,
            a.studentAccount_ID,
            a.date,
            a.rating,
            a.assessmentProfile_ID,
            ap.strand_ID AS resolved_strand
          FROM tbl_studentassessments a
          LEFT JOIN tbl_assessmentprofiles ap ON a.assessmentProfile_ID = ap.assessmentProfile_ID
          LEFT JOIN tbl_studentaccounts sa ON a.studentAccount_ID = sa.studentAccount_ID
        ) a_res ON a_res.resolved_strand = s.strand_ID

        LEFT JOIN tbl_assessmentprofiles ap ON a_res.assessmentProfile_ID = ap.assessmentProfile_ID
        LEFT JOIN (
          SELECT studentAssessment_ID, AVG(alignmentScore) AS avgAlignment
          FROM tbl_recommendations
          WHERE track_aligned = 'Y'
          GROUP BY studentAssessment_ID
        ) pa ON pa.studentAssessment_ID = a_res.studentAssessment_ID
      `;

      if (whereClauses.length > 0) {
        sql += ` WHERE ${whereClauses.join(' AND ')}`;
      }

      sql += ` GROUP BY s.strand_ID, s.strandName ORDER BY s.strandName`;

      const [rows] = await db.promise().query(sql, whereParams);

      // For each strand, fetch top RIASEC traits, top BigFive traits and top 5 programs
      const results = await Promise.all((rows || []).map(async (r) => {
        const strandId = r.strand_ID;

        // Aggregate RIASEC trait sums for the strand (respect date & grade filters)
        // Use only the assessment profile's strand (ap.strand_ID = ?).
        let riasecSql = `
          SELECT
            SUM(rr.realistic) AS realistic,
            SUM(rr.investigative) AS investigative,
            SUM(rr.artistic) AS artistic,
            SUM(rr.social) AS social,
            SUM(rr.enterprising) AS enterprising,
            SUM(rr.conventional) AS conventional
          FROM tbl_riasecresults rr
            JOIN tbl_studentassessments sa ON rr.riasecResult_ID = sa.riasecResult_ID
            JOIN tbl_studentaccounts sac ON sa.studentAccount_ID = sac.studentAccount_ID
            LEFT JOIN tbl_studentprofiles sp ON sac.studentProfile_ID = sp.studentProfile_ID
            LEFT JOIN tbl_assessmentprofiles ap ON sa.assessmentProfile_ID = ap.assessmentProfile_ID
            WHERE ap.strand_ID = ?
        `;
        const riasecParams = [strandId];
        if (startDate && endDate) {
          riasecSql += ` AND DATE(sa.date) BETWEEN ? AND ?`;
          riasecParams.push(startDate, endDate);
        } else if (startDate) {
          riasecSql += ` AND DATE(sa.date) >= ?`;
          riasecParams.push(startDate);
        } else if (endDate) {
          riasecSql += ` AND DATE(sa.date) <= ?`;
          riasecParams.push(endDate);
        }
        if (grade) {
          const g = parseInt(grade, 10);
          if (!Number.isNaN(g)) {
            riasecSql += ` AND ap.gradeLevel = ?`;
            riasecParams.push(g);
          }
        }

        const [riasecRows] = await db.promise().query(riasecSql, riasecParams);
        const riasecTotals = riasecRows && riasecRows[0] ? riasecRows[0] : null;

        const riasecList = [];
        if (riasecTotals) {
          Object.entries(riasecTotals).forEach(([k, v]) => {
            riasecList.push({ trait: k, value: v != null ? Number(v) : 0 });
          });
        }
        riasecList.sort((a, b) => b.value - a.value);
        const topRiasec = riasecList.slice(0, 2).map((t) => t.trait.charAt(0).toUpperCase() + t.trait.slice(1));

        // Aggregate BigFive trait sums for the strand
        // Use only the assessment profile's strand (ap.strand_ID = ?).
        let bigFiveSql = `
          SELECT
            SUM(bf.openness) AS openness,
            SUM(bf.conscientiousness) AS conscientiousness,
            SUM(bf.extraversion) AS extraversion,
            SUM(bf.agreeableness) AS agreeableness,
            SUM(bf.neuroticism) AS neuroticism
          FROM tbl_bigfiveresults bf
          JOIN tbl_studentassessments sa ON bf.bigFiveResult_ID = sa.bigFiveResult_ID
          JOIN tbl_studentaccounts sac ON sa.studentAccount_ID = sac.studentAccount_ID
          LEFT JOIN tbl_studentprofiles sp ON sac.studentProfile_ID = sp.studentProfile_ID
          LEFT JOIN tbl_assessmentprofiles ap ON sa.assessmentProfile_ID = ap.assessmentProfile_ID
          WHERE ap.strand_ID = ?
        `;
        const bigFiveParams = [strandId];
        if (startDate && endDate) {
          bigFiveSql += ` AND DATE(sa.date) BETWEEN ? AND ?`;
          bigFiveParams.push(startDate, endDate);
        } else if (startDate) {
          bigFiveSql += ` AND DATE(sa.date) >= ?`;
          bigFiveParams.push(startDate);
        } else if (endDate) {
          bigFiveSql += ` AND DATE(sa.date) <= ?`;
          bigFiveParams.push(endDate);
        }
        if (grade) {
          const g = parseInt(grade, 10);
          if (!Number.isNaN(g)) {
            bigFiveSql += ` AND ap.gradeLevel = ?`;
            bigFiveParams.push(g);
          }
        }

        const [bigFiveRows] = await db.promise().query(bigFiveSql, bigFiveParams);
        const bigFiveTotals = bigFiveRows && bigFiveRows[0] ? bigFiveRows[0] : null;

        const bigFiveList = [];
        if (bigFiveTotals) {
          Object.entries(bigFiveTotals).forEach(([k, v]) => {
            bigFiveList.push({ trait: k, value: v != null ? Number(v) : 0 });
          });
        }
        bigFiveList.sort((a, b) => b.value - a.value);
        const topBigFive = bigFiveList.slice(0, 2).map((t) => t.trait.charAt(0).toUpperCase() + t.trait.slice(1));

        // Top 5 programs for the strand (by recommendation count, include avg alignment)
        let programsSql = `
          SELECT p.program_ID, p.programName, COUNT(*) AS reco_count, ROUND(AVG(r.alignmentScore),2) AS avgAlignment
          FROM tbl_recommendations r
          JOIN tbl_programs p ON r.program_ID = p.program_ID
          JOIN tbl_studentassessments sa ON r.studentAssessment_ID = sa.studentAssessment_ID
          JOIN tbl_studentaccounts sac ON sa.studentAccount_ID = sac.studentAccount_ID
          JOIN tbl_studentprofiles sp ON sac.studentProfile_ID = sp.studentProfile_ID
          LEFT JOIN tbl_assessmentprofiles ap ON sa.assessmentProfile_ID = ap.assessmentProfile_ID
          -- Use strand from assessment profile (ap.strand_ID) so recommendations are scoped to the assessment's recorded strand
          WHERE ap.strand_ID = ? AND r.track_aligned = 'Y'
          GROUP BY p.program_ID, p.programName
          ORDER BY reco_count DESC, avgAlignment DESC
          LIMIT 5
        `;
        const progParams = [strandId];
        // apply date and grade filters by rewriting WHERE, since we already include base conditions above
        if (startDate && endDate) {
          programsSql = programsSql.replace('WHERE ap.strand_ID = ? AND r.track_aligned = \'Y\'', 'WHERE ap.strand_ID = ? AND r.track_aligned = \'Y\' AND DATE(sa.date) BETWEEN ? AND ?');
          progParams.push(startDate, endDate);
        } else if (startDate) {
          programsSql = programsSql.replace('WHERE ap.strand_ID = ? AND r.track_aligned = \'Y\'', 'WHERE ap.strand_ID = ? AND r.track_aligned = \'Y\' AND DATE(sa.date) >= ?');
          progParams.push(startDate);
        } else if (endDate) {
          programsSql = programsSql.replace('WHERE ap.strand_ID = ? AND r.track_aligned = \'Y\'', 'WHERE ap.strand_ID = ? AND r.track_aligned = \'Y\' AND DATE(sa.date) <= ?');
          progParams.push(endDate);
        }
        if (grade) {
          const g = parseInt(grade, 10);
          if (!Number.isNaN(g)) {
            programsSql = programsSql.replace('WHERE ap.strand_ID = ? AND r.track_aligned = \'Y\'', 'WHERE ap.strand_ID = ? AND r.track_aligned = \'Y\' AND ap.gradeLevel = ?');
            progParams.push(g);
          }
        }

        const [progRows] = await db.promise().query(programsSql, progParams);
        const topPrograms = (progRows || []).map((p) => ({
          programId: p.program_ID,
          programName: p.programName,
          count: p.reco_count != null ? Number(p.reco_count) : 0,
          avgAlignment: p.avgAlignment != null ? Number(p.avgAlignment) : 0,
        }));

        return {
          strand: r.strandName,
          strandId: strandId,
          avgAlignment: r.avgAlignment != null ? Number(r.avgAlignment) : 0,
          assessments: r.assessments_count != null ? Number(r.assessments_count) : 0,
          avgSatisfaction: r.avgSatisfaction != null ? Number(r.avgSatisfaction) : 0,
          topRiasec,
          topBigFive,
          topPrograms,
        };
      }));

      return res.json({ success: true, data: results });
    } catch (err) {
      console.error('Error fetching strand analytics:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // GET /api/admin/total-assessments
  // Returns combined counts from completed assessments and pending assessments
  router.get('/admin/total-assessments', async (req, res) => {
    try {
      const [doneRows] = await db.promise().query('SELECT COUNT(*) AS completed FROM tbl_studentassessments');
      const [pendingRows] = await db.promise().query('SELECT COUNT(*) AS pending FROM tbl_pendingassessments');
      const completed = doneRows && doneRows[0] ? Number(doneRows[0].completed) : 0;
      const pending = pendingRows && pendingRows[0] ? Number(pendingRows[0].pending) : 0;
      return res.json({ success: true, data: { total: completed + pending, completed, pending } });
    } catch (err) {
      console.error('Error fetching total assessments:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  return router;
};


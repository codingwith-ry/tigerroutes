const express = require('express');

module.exports = (db) => {
  const router = express.Router();

  // GET /api/assessments
  // Returns paginated list of assessments with computed average alignment (track_aligned recommendations)
  router.get('/assessments', async (req, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page || '1', 10));
      const pageSize = Math.max(1, parseInt(req.query.pageSize || '10', 10));
      const q = (req.query.q || '').trim();
      const offset = (page - 1) * pageSize;

      // Base query: fetch assessments with student and strand info
      let baseQuery = `
        SELECT
          sa.studentAssessment_ID AS assessmentId,
          sa.studentAccount_ID AS studentAccountId,
          sa.date,
          sa.rating,
          st.name AS studentName,
          s.strandName AS strand
        FROM tbl_studentassessments sa
        LEFT JOIN tbl_studentaccounts st ON sa.studentAccount_ID = st.studentAccount_ID
        LEFT JOIN tbl_studentprofiles sp ON st.studentProfile_ID = sp.studentProfile_ID
        LEFT JOIN tbl_strands s ON sp.strand_ID = s.strand_ID
      `;

      const params = [];
      if (q) {
        baseQuery += ` WHERE (sa.studentAssessment_ID LIKE ? OR st.name LIKE ? OR s.strandName LIKE ?)`;
        const like = `%${q}%`;
        params.push(like, like, like);
      }

      baseQuery += ` ORDER BY sa.date DESC LIMIT ? OFFSET ?`;
      params.push(pageSize, offset);

      const [rows] = await db.promise().query(baseQuery, params);

      if (!rows || rows.length === 0) {
        return res.json({ success: true, data: [], total: 0 });
      }

      // compute average alignment for returned assessment IDs
      const ids = rows.map((r) => r.assessmentId);
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

      // total count (for pagination) - simple count without filters when q is empty
      let total = null;
      if (!q) {
        const [countRows] = await db.promise().query('SELECT COUNT(*) AS total FROM tbl_studentassessments');
        total = countRows && countRows[0] ? countRows[0].total : data.length;
      }

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

          // Delete only when the note belongs to the staffAccount_ID provided
          const deleteSql = `DELETE FROM tbl_counselornotes WHERE counselorNote_ID = ? AND studentAssessment_ID = ? AND staffAccount_ID = ?`;
          const [result] = await db.promise().query(deleteSql, [noteId, assessmentId, staffAccount_ID]);

          if (result.affectedRows && result.affectedRows > 0) {
            return res.json({ success: true, message: 'Note deleted' });
          }

          return res.status(403).json({ success: false, message: 'Not authorized to delete this note or note not found' });
        } catch (err) {
          console.error('Error deleting counselor note:', err);
          return res.status(500).json({ success: false, message: err.message });
        }
      });

  return router;
};

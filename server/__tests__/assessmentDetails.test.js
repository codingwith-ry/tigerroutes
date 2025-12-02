// Mock mysql2 before requiring the app so the server picks up the mock pool
jest.mock('mysql2', () => ({
  createPool: () => ({
    // minimal pool interface used by server.js and assessmentRoutes
    getConnection: (cb) => cb(null, { release: () => {} }),
    on: () => {},
    // callback-style query used heavily in assessmentRoutes
    query: (sql, params, cb) => {
      const s = (sql || '').toString().toLowerCase();

      // initial lookup: fetchPsychometricIDs
      if (s.includes('from tbl_studentassessments') && s.includes('where') && s.includes('studentassessment_id')) {
        const row = [{
          assessmentProfile_ID: 111,
          studentAccount_ID: 222,
          riasecResult_ID: 333,
          bigFiveResult_ID: 444,
          rating: 5,
          feedback: 'Great assessment'
        }];
        return cb(null, row);
      }

      // fetchStudentProfile
      if (s.includes('from tbl_assessmentprofiles') || s.includes('from tbl_studentprofiles')) {
        const row = [{
          name: 'Test Student',
          email: 'student@example.com',
          gradeLevel: 12,
          strandName: 'STEM',
          mathGrade: 95,
          scienceGrade: 92,
          englishGrade: 90,
          genAverageGrade: 92.3,
          date: (new Date()).toISOString()
        }];
        return cb(null, row);
      }

      // fetchRIASEC
      if (s.includes('from tbl_riasecresults')) {
        const row = [{ realistic: 80, investigative: 70, artistic: 30, social: 40, enterprising: 50, conventional: 60, riasecResult_ID: 333 }];
        return cb(null, row);
      }

      // fetchBigFive
      if (s.includes('from tbl_bigfiveresults')) {
        const row = [{ openness: 60, conscientiousness: 70, extraversion: 50, agreeableness: 65, neuroticism: 30, bigFiveResult_ID: 444 }];
        return cb(null, row);
      }

      // fetchProgramRecoDetails
      if (s.includes('from tbl_recommendations')) {
        // return empty array to simulate no recommendations
        return cb(null, []);
      }

      // fetchCounselorNotes
      if (s.includes('from tbl_counselornotes')) {
        return cb(null, []);
      }

      // default: return empty rows
      return cb(null, []);
    }
  })
}));

const request = require('supertest');
const app = require('../server');

describe('Assessment details endpoint', () => {
  test('GET /api/assessment/assessmentDetails returns expected payload for valid assessmentID', async () => {
    const assessmentID = 'ad84be7b-6908-4372-a074-509843c4c8c6';
    const res = await request(app).get(`/api/assessment/assessmentDetails?assessmentID=${encodeURIComponent(assessmentID)}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data');
    const data = res.body.data;
    expect(data).toHaveProperty('assessmentID', assessmentID);
    expect(data).toHaveProperty('assessmentProfile');
    expect(data.assessmentProfile).toHaveProperty('name', 'Test Student');
    expect(data).toHaveProperty('riasec');
    expect(data.riasec).toHaveProperty('realistic', 80);
    expect(data).toHaveProperty('bigFive');
    expect(data.bigFive).toHaveProperty('openness', 60);
    expect(data).toHaveProperty('programRecommendations');
    expect(data.programRecommendations.track_aligned).toBeInstanceOf(Array);
    expect(data.programRecommendations.cross_track).toBeInstanceOf(Array);
  });
});

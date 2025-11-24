// Server Address: http://localhost:5000
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');


const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
const PORT = 5000;

// app.use(cors());
// app.use(express.json());

// JWT and Cookie Parser
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Session support (store sessions server-side; cookie contains opaque session id)
const session = require('express-session');
app.use(session({
    name: process.env.SESSION_COOKIE_NAME || 'tigerroutes.sid',
    secret: process.env.SESSION_SECRET || 'change-this-in-prod',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 2 // 2 hours
    }
}));

//Google Stuffs
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client();

// MySQL connection
const dbConfig = {
  host: 'tigerroutesdb.c4f8mocc8fh0.us-east-1.rds.amazonaws.com',
  user: process.env.DB_USER,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONN_LIMIT) || 10,
  queueLimit: 0
};

const db = mysql.createPool(dbConfig);

db.getConnection((err, conn) => {
  if (err) {
    console.error('MySQL connection error:', err && err.message ? err.message : err);
    process.exit(1);
  }
  console.log('Connected to MySQL as', process.env.DB_USER, '@', process.env.DB_HOST);
  conn.release();
});


//importing all login/register routes
const loginRoutes = require('./loginRoutes.js')(db); 
app.use('/api', loginRoutes);

//importing all profile routes
const profileRoutes = require('./profileRoutes.js')(db);
app.use('/api', profileRoutes);

//importing all assessment routes
const assessmentRoutes = require('./assessmentRoutes.js')(db);
app.use('/api', assessmentRoutes);

//importing admin dashboard route
const admindashboardRoutes = require('./admindashboardRoutes.js')(db);
app.use('/api', admindashboardRoutes);

//importing admin counselor routes
const admincounselorRoutes = require('./admincounselorRoutes.js')(db);
app.use('/api', admincounselorRoutes);

// importing admin assessment routes
const adminassessmentRoutes = require('./adminassessmentRoutes.js')(db);
app.use('/api', adminassessmentRoutes);

// importing admin logs route
const adminlogsRoutes = require('./adminlogs.js')(db);
app.use('/api', adminlogsRoutes);

app.listen(PORT, () => {
    console.log('Server is running on port', PORT)
})
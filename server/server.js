// Server Address: http://localhost:5000
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

//Google Stuffs
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client();

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // change if needed
    password: 'none', // change if needed
    database: 'tigerroutesdb'
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

app.listen(PORT, () => {
    console.log('Server is running on port', PORT)
})
// Server Address: http://localhost:5000
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(cors());
app.use(express.json());
const PORT = 5000;

app.use(cors());
app.use(express.json());

//Google Stuffs
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client();

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // change if needed
    password: '', // change if needed
    database: 'tigerroutesdb'
});

//importing all login/register routes
const loginRoutes = require('./loginRoutes.js')(db); 
app.use('/api', loginRoutes);


app.listen(PORT, () => {
    console.log('Server is running on port', PORT)
})
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

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // change if needed
    password: '', // change if needed
    database: 'tigerroutesdb'
});

// Register endpoint
app.post('/api/register', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({error: 'Please fill in all fields'});
    }
    db.query(
        'INSERT into tbl_studentaccounts (name, email, password) VALUES (?, ?, ?)',
        ["placeholder", email, password],
        (err, result) => {
            if (err) return res.status(500).json({error: err.message});
            res.json({success:true, id: result.insertId});
        }
    )
})


app.get('/api/students', (req, res) => {

})


app.listen(PORT, () => {
    console.log('Server is running on port', PORT)
})
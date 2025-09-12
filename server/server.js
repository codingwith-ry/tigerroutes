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

// Register endpoint
app.post('/api/register', (req, res) => {
    const { name, email, password } = req.body;
    if (name, !email || !password) {
        return res.status(400).json({error: 'Please fill in all fields'});
    }
    db.query(
        'INSERT into tbl_studentaccounts (name, email, password) VALUES (?, ?, ?)',
        [name, email, password],
        (err, result) => {
            if (err) return res.status(500).json({error: err.message});
            res.json({success:true, id: result.insertId});
        }
    )
})

//token verification using Google API
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: "64875843215-fujh9oveth87r16ir4qvu7psoc098j0h.apps.googleusercontent.com", //Client ID
    })
    const payload = ticket.getPayLoad();
}

app.post('/api/google-auth', (req, res) => {
    const { email, name } = req.body;
    if (!email || !name) {
        return res.status(400).json({ error: 'Missing email or name' });
    }
    db.query(
        'SELECT * FROM tbl_studentaccounts WHERE email = ?',
        [email],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            if (results.length > 0) {
                return res.json({ success: true, isNew: false});
            } else {
                db.query(
                    'INSERT INTO tbl_studentaccounts (name, email, password) VALUES (?, ?, ?)',
                    [name, email, ''],
                    (err2, result2) => {
                        if (err2) return res.status(500).json({ error: err2.message });
                        return res.json({ success: true, isNew: true});
                    }
                );
            }
        }
    );
});



app.get('/api/students', (req, res) => {

})


app.listen(PORT, () => {
    console.log('Server is running on port', PORT)
})
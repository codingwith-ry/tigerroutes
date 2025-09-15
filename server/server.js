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

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required'});
    }
    db.query(
        'SELECT * FROM tbl_studentaccounts WHERE email = ? AND password = ?',
        [email, password],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message});
            if (results.length > 0) {
                // User found
                res.json({ success: true, user: results[0]});
            } else {
                // No match
                res.json({ success: false, error: 'Invalid email or password' });
            }
        }
    )
})

//reset password and mailers
const nodemailer=require('nodemailer');
const resetCodes = {};
app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    //Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000;
    resetCodes[email] = { code, expires };

    //Nodemailer transporter
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'dominicxandy.adino.cics@ust.edu.ph', //change this email
            pass: 'fdvp mbeg iold wmfe'//put password here
        }
    });

    const mailOptions = {
        from: 'dominicxandy.adino.cics@ust.edu.ph',
        to: email,
        subject: 'TigerRoutes Password Reset',
        html: `
        <p>Your password reset code is: <b>${code}</b></p>
        <p>Or click <a href="http://localhost:3000/otp?email=${encodeURIComponent(email)}&code=${code}">here</a> to enter your code.</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to send email.' });
    }
});

app.post('/api/verify-reset', (req, res) => {
    const { email, code } = req.body;
    const entry = resetCodes[email];
    if (!entry) return res.status(400).json({ error: 'No reset code found.' });
    if (Date.now() > entry.expires) return res.status(400).json({ error: 'Code expired.' });
    if (entry.code !== code) return res.status(400).json({ error: 'Invalid Code.'});
    delete resetCodes[email];
    res.json({ success: true });
})

app.post('/api/reset-password', (req,res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and new password required'});
    }
    db.query(
        'UPDATE tbl_studentaccounts SET password = ? WHERE email = ?',
        [password, email],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message});
            if (results.affectedRows === 0 ) {
                return res.status(404).json({ error: 'Account not found.'});
            }
            res.json({ success: true });
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
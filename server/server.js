// Server Address: http://localhost:5000
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const {
  BedrockAgentRuntimeClient,
  InvokeAgentCommand
} = require("@aws-sdk/client-bedrock-agent-runtime");


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

// JWT cookie verification middleware (reads tigerToken cookie and sets req.user)
const verifyJwtCookie = require('./middleware/verifyJwtCookie');
app.use(verifyJwtCookie);

//Google Stuffs
const { OAuth2Client } = require('google-auth-library');

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


// Initialize Bedrock client
const client = new BedrockAgentRuntimeClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

//chatbot route
app.post("/api/chatbot", async (req, res) => {
  try {
    const { userMessage, sessionId } = req.body;

    const command = new InvokeAgentCommand({
      agentId: process.env.BEDROCK_AGENT_ID,
      agentAliasId: process.env.BEDROCK_AGENT_ALIAS,
      sessionId: sessionId || "default-session",
      inputText: userMessage
    });

    const response = await client.send(command);

    let finalOutput = "";

    for (const event of response.completion) {
      if (event.chunk) {
        finalOutput += Buffer.from(event.chunk.bytes).toString("utf-8");
      }
    }

    res.json({ output: finalOutput });

  } catch (error) {
    console.error("Bedrock agent error:", error);
    res.status(500).json({ error: "Failed to invoke agent" });
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
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
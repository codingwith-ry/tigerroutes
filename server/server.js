// Server Address: http://localhost:5000
const path = require('path');

// Load environment variables from .env file based on NODE_ENV
const env = (process.env.NODE_ENV || 'development').trim();
const envPath = path.resolve(__dirname, `../.env.${env}`);
require('dotenv').config({ path: envPath });
console.log(`Loaded environment variables from ${envPath}`);

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
// Bedrock SDK is optional — guard require so server can run without it.
let BedrockAgentRuntimeClient, InvokeAgentCommand;
let client = null;
try {
  const bedrockPkg = require("@aws-sdk/client-bedrock-agent-runtime");
  BedrockAgentRuntimeClient = bedrockPkg.BedrockAgentRuntimeClient;
  InvokeAgentCommand = bedrockPkg.InvokeAgentCommand;
} catch (err) {
  console.warn("Bedrock SDK not available — chatbot route will be disabled.", err && err.message ? err.message : err);
}


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

// Diagnostic: check presence and validity of PASSWORD_REVEAL_KEY (do NOT log the key itself)
try {
  const raw = process.env.PASSWORD_REVEAL_KEY;
  if (!raw) {
    console.warn('PASSWORD_REVEAL_KEY is not set in environment. Reveal/encryption will be unavailable.');
  } else {
    // provide diagnostic info about raw vs cleaned key without printing the key
    const cleaned = raw.replace(/\uFEFF/g, '').trim().replace(/[^A-Za-z0-9+/=]/g, '');
    try {
      const buf = Buffer.from(cleaned, 'base64');
      console.log('PASSWORD_REVEAL_KEY present; raw length =', raw.length, ', cleaned length =', cleaned.length, ', decoded length =', buf.length);
      if (buf.length !== 32) console.warn('PASSWORD_REVEAL_KEY decoded length is not 32 bytes; encryption will fail.');
    } catch (e) {
      console.warn('PASSWORD_REVEAL_KEY is present but cleaned value is not valid base64:', e && e.message ? e.message : e);
    }
  }
} catch (e) {
  console.warn('Error while checking PASSWORD_REVEAL_KEY:', e && e.message ? e.message : e);
}

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

// JWT cookie verification middleware (reads `tigerStaffToken` for staff or `tigerToken` for users and sets `req.user`)
const verifyJwtCookie = require('./middleware/verifyJwtCookie');
app.use(verifyJwtCookie);

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

// Try initial getConnection but do not crash the process on transient errors.
db.getConnection((err, conn) => {
  if (err) {
    console.error('MySQL initial connection error:', err && err.message ? err.message : err);
    console.warn('Server will continue running; pool will attempt to reconnect on demand.');
    return; // do not exit the process
  }
  console.log('Connected to MySQL as', process.env.DB_USER, '@', dbConfig.host);
  conn.release();
});

// Monitor connection errors on acquired connections
if (typeof db.on === 'function') {
  db.on('connection', (connection) => {
    connection.on('error', (err) => {
      console.error('MySQL connection error (connection event):', err && err.message ? err.message : err);
    });
  });
}


// Initialize Bedrock client only when SDK loaded and required env vars present
if (typeof BedrockAgentRuntimeClient !== 'undefined') {
  if (process.env.AWS_REGION && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    client = new BedrockAgentRuntimeClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });
  } else {
    console.warn('Bedrock SDK present but AWS credentials/region missing — chatbot route will be disabled until configured.');
  }
}

//chatbot route
app.post("/api/chatbot", async (req, res) => {
  try {
    const { userMessage } = req.body;

    const command = new InvokeAgentCommand({
      agentId: process.env.AGENT_ID,
      agentAliasId: process.env.AGENT_ALIAS_ID,
      sessionId: "newSession",
      inputText: userMessage,
    });

    const response = await client.send(command);

    let text = "";
    for await (const chunk of response.completion) {
      text += new TextDecoder().decode(chunk.chunk.bytes);
    }

    text = text
      .replace(/\\n/g, "\n") // turn \\n into real newlines
      .replace(/\n{2,}/g, "\n") // clean multiple blank lines
      .trim();

    text = text.replace(/\\/g, "").trim();


    res.json({ reply: text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// lightweight health-check used for tests/monitoring
app.get('/__health', (req, res) => res.json({ ok: true }));

// NOTE: single app.listen occurs at the bottom using PORT
    
//importing all login/register routes
const loginRoutes = require('./loginRoutes.js')(db); 
app.use('/api', loginRoutes);

// Mount admin routers early so they are not intercepted by other /api routers
// importing admin dashboard route (mount under /api/admin to avoid collisions with user routes)
const admindashboardRoutes = require('./admindashboardRoutes.js')(db);
app.use('/api/admin', admindashboardRoutes);

// importing admin counselor routes
const admincounselorRoutes = require('./admincounselorRoutes.js')(db);
app.use('/api/admin', admincounselorRoutes);

// importing admin assessment routes
const adminassessmentRoutes = require('./adminassessmentRoutes.js')(db);
app.use('/api/admin', adminassessmentRoutes);

// importing admin logs route
const adminlogsRoutes = require('./adminlogs.js')(db);
app.use('/api/admin', adminlogsRoutes);

//importing all assessment routes
const assessmentRoutes = require('./assessmentRoutes.js')(db);
app.use('/api', assessmentRoutes);

//importing all profile routes
const profileRoutes = require('./profileRoutes.js')(db);
app.use('/api', profileRoutes);


// If this file is the entrypoint, start listening. Otherwise export `app` for tests.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log('Server is running on port', PORT);
  });
} else {
  module.exports = app;
}
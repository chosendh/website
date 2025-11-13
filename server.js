const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Database setup
const db = new sqlite3.Database(':memory:');

// Create tables
db.serialize(() => {
    db.run(`CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE scripts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        script_name TEXT,
        original_code TEXT,
        protected_code TEXT,
        script_key TEXT UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);
});

// Serve homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve dashboard
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// API Routes

// User registration
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.json({ success: false, message: 'Username and password required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run('INSERT INTO users (username, password) VALUES (?, ?)', 
               [username, hashedPassword], 
               function(err) {
            if (err) {
                return res.json({ success: false, message: 'Username already exists' });
            }
            res.json({ success: true, message: 'Registration successful' });
        });
    } catch (error) {
        res.json({ success: false, message: 'Registration failed' });
    }
});

// User login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err || !user) {
            return res.json({ success: false, message: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.json({ success: false, message: 'Invalid credentials' });
        }

        res.json({ success: true, message: 'Login successful', userId: user.id });
    });
});

// Upload and protect script
app.post('/api/protect-script', (req, res) => {
    const { userId, scriptName, scriptCode } = req.body;

    if (!userId || !scriptCode) {
        return res.json({ success: false, message: 'Missing required fields' });
    }

    // Generate unique key for this script
    const scriptKey = generateRandomKey();

    // Basic obfuscation (you can enhance this later)
    const protectedCode = obfuscateScript(scriptCode);

    db.run('INSERT INTO scripts (user_id, script_name, original_code, protected_code, script_key) VALUES (?, ?, ?, ?, ?)',
           [userId, scriptName, scriptCode, protectedCode, scriptKey],
           function(err) {
        if (err) {
            return res.json({ success: false, message: 'Failed to save script' });
        }

        const loadstring = `loadstring(game:HttpGet("${getServerURL()}/load/${scriptKey}"))()`;
        res.json({ 
            success: true, 
            message: 'Script protected successfully',
            loadstring: loadstring,
            scriptId: this.lastID
        });
    });
});

// Script loader endpoint (what users will call)
app.get('/load/:scriptKey', (req, res) => {
    const scriptKey = req.params.scriptKey;

    db.get('SELECT protected_code FROM scripts WHERE script_key = ?', [scriptKey], (err, row) => {
        if (err || !row) {
            return res.status(404).send('Script not found');
        }

        res.setHeader('Content-Type', 'text/plain');
        res.send(row.protected_code);
    });
});

// Get user's scripts
app.get('/api/user-scripts/:userId', (req, res) => {
    const userId = req.params.userId;

    db.all('SELECT * FROM scripts WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, rows) => {
        if (err) {
            return res.json({ success: false, scripts: [] });
        }

        const scripts = rows.map(row => ({
            id: row.id,
            name: row.script_name,
            key: row.script_key,
            loadstring: `loadstring(game:HttpGet("${getServerURL()}/load/${row.script_key}"))()`,
            created: row.created_at
        }));

        res.json({ success: true, scripts: scripts });
    });
});

// Helper functions
function generateRandomKey() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function obfuscateScript(code) {
    // Basic obfuscation - you can improve this later
    return `-- Protected Script\nprint("Script loaded successfully")\n${code}`;
}

function getServerURL() {
    return `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
}

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit: https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
});
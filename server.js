const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const midtrans = require('./midtrans');
const pool = require('./database'); // Mengimpor connection pool

const app = express();
const port = 5001;

// "Database" dalam memori untuk sesi dan pengaturan (data pemain akan ada di MySQL)
const db = {
    admins: { admin: { password: 'admin123' } },
    sessions: {},

};

midtrans.init(db.settings.midtrans_server_key, db.settings.midtrans_is_production === 'true');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Middleware dan rute
function authMiddleware(req, res, next) {
    const sessionId = req.cookies.sessionId;
    if (sessionId && db.sessions[sessionId]) {
        req.user = db.sessions[sessionId];
        return next();
    }
    res.redirect('/admin');
}

app.post('/login', (req, res) => {
    // ... (logika login)
});

app.get('/dashboard', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
});




// Middleware file statis (di akhir)
app.use('/admin', express.static(path.join(__dirname, 'admin')));
app.use(express.static(path.join(__dirname, '')));

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const midtrans = require('./midtrans');

const app = express();
const port = 5001;

// "Database" dalam memori
const db = {
    admins: { admin: { password: 'admin123' } },
    sessions: {},
    playerData: {},
    rtpSettings: { global: 95, users: {} },
    midtransSettings: { server_key: 'YOUR_SERVER_KEY', is_production: false, notification_url: '' }
};

midtrans.init(db.midtransSettings.server_key, db.midtransSettings.is_production);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Middleware untuk melindungi rute admin
function authMiddleware(req, res, next) {
    const sessionId = req.cookies.sessionId;
    if (sessionId && db.sessions[sessionId]) {
        req.user = db.sessions[sessionId];
        return next();
    }
    res.redirect('/admin');
}

// Rute API dan admin
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (db.admins[username] && db.admins[username].password === password) {
        const sessionId = Math.random().toString(36).substring(2);
        db.sessions[sessionId] = { username };
        res.cookie('sessionId', sessionId, { httpOnly: true });
        res.redirect('/dashboard');
    } else {
        res.status(401).send('Nama pengguna atau kata sandi salah');
    }
});

app.get('/dashboard', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
});

app.get('/api/dashboard-data', authMiddleware, (req, res) => {
    res.json({
        players: Object.values(db.playerData),
        rtpSettings: db.rtpSettings
    });
});

app.post('/api/rtp-settings', authMiddleware, (req, res) => {
    const { key, value } = req.body;
    if (key === 'global') {
        db.rtpSettings.global = parseInt(value, 10);
    } else if (key.startsWith('user_')) {
        const playerId = key.replace('user_', '');
        db.rtpSettings.users[playerId] = parseInt(value, 10);
    }
    res.json({ success: true });
});

app.get('/api/midtrans-config', authMiddleware, (req, res) => {
    res.json(db.midtransSettings);
});

app.post('/api/midtrans-config', authMiddleware, (req, res) => {
    const { server_key, is_production, notification_url } = req.body;
    db.midtransSettings = { server_key, is_production: is_production === 'on', notification_url };
    midtrans.init(db.midtransSettings.server_key, db.midtransSettings.is_production);
    res.json({ success: true });
});

app.post('/api/adjust-credit', authMiddleware, (req, res) => {
    const { playerId, amount } = req.body;
    if (!db.playerData[playerId]) {
        db.playerData[playerId] = { player_id: playerId, total_bet: 0, total_win: 0 };
    }
    db.playerData[playerId].total_win += parseInt(amount, 10);
    res.json({ success: true });
});

function generateLosingPattern() {
    let aFinalSymbols = [];
    for (let i = 0; i < 3; i++) {
        aFinalSymbols[i] = [];
        for (let j = 0; j < 5; j++) {
            aFinalSymbols[i][j] = Math.floor(Math.random() * 10);
        }
    }
    return aFinalSymbols;
}

app.post('/api/spin', (req, res) => {
    const { bet, playerId } = req.body;
    if (!db.playerData[playerId]) {
        db.playerData[playerId] = { player_id: playerId, total_bet: 0, total_win: 0 };
    }
    db.playerData[playerId].total_bet += bet;

    const rtp = db.rtpSettings.users[playerId] || db.rtpSettings.global;

    let win = 0;
    if (Math.random() * 100 < rtp) {
        win = bet * 2;
    }
    db.playerData[playerId].total_win += win;

    res.json({
        res: true,
        win: win > 0,
        pattern: generateLosingPattern(),
        win_lines: [],
        money: db.playerData[playerId].total_win - db.playerData[playerId].total_bet,
        tot_win: win,
    });
});

app.post('/api/create-payment', async (req, res) => {
    const { amount, playerId } = req.body;
    const coreApi = midtrans.getCoreApi();

    const parameter = {
        "payment_type": "qris",
        "transaction_details": {
            "gross_amount": amount,
            "order_id": `order-${playerId}-${Date.now()}`,
        },
    };

    try {
        const chargeResponse = await coreApi.charge(parameter);
        res.json(chargeResponse);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/notification', (req, res) => {
    // ... (logika notifikasi seperti sebelumnya)
});


// Middleware file statis (di akhir)
app.use('/admin', express.static(path.join(__dirname, 'admin')));
app.use(express.static(path.join(__dirname, '')));


app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});

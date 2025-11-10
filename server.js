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

// Endpoint baru untuk mengambil data pengguna berdasarkan deviceId
app.get('/api/user/:deviceId', (req, res) => {
    const { deviceId } = req.params;
    const query = 'SELECT * FROM users WHERE deviceId = ?';
    pool.query(query, [deviceId], (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    });
});

// Endpoint baru untuk membuat atau memperbarui data pengguna
app.post('/api/user', (req, res) => {
    const { deviceId, credits } = req.body;
    const query = 'INSERT INTO users (deviceId, credits) VALUES (?, ?) ON DUPLICATE KEY UPDATE credits = ?';
    pool.query(query, [deviceId, credits, credits], (err, results) => {
        if (err) {
            console.error('Error saving user data:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json({ success: true, message: 'User data saved' });
    });
});

app.get('/api/dashboard-data', authMiddleware, (req, res) => {
    const query = 'SELECT deviceId as player_id, credits as total_win FROM users'; // Menyesuaikan query
    pool.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching dashboard data:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json({
            players: results,
            rtpSettings: db.rtpSettings
        });
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
    const query = 'UPDATE users SET credits = credits + ? WHERE deviceId = ?';
    pool.query(query, [amount, playerId], (err, result) => {
        if (err) {
            console.error('Error adjusting credit:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (result.affectedRows === 0) {
            // Jika user tidak ada, buat user baru dengan kredit tersebut
            const insertQuery = 'INSERT INTO users (deviceId, credits) VALUES (?, ?)';
            pool.query(insertQuery, [playerId, amount], (insertErr) => {
                if (insertErr) {
                    console.error('Error creating user on adjust credit:', insertErr);
                    return res.status(500).json({ error: 'Internal server error' });
                }
                res.json({ success: true });
            });
        } else {
            res.json({ success: true });
        }
    });
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
    const { bet, playerId } = req.body; // playerId di sini adalah deviceId
    const rtp = db.rtpSettings.users[playerId] || db.rtpSettings.global;

    let win = 0;
    if (Math.random() * 100 < rtp) {
        win = bet * 2; // Contoh logika kemenangan
    }

    const creditChange = win - bet;
    const query = 'UPDATE users SET credits = credits + ? WHERE deviceId = ?';

    pool.query(query, [creditChange, playerId], (err, result) => {
        if (err) {
            console.error('Error updating credits on spin:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found for spin' });
        }

        // Ambil kredit terbaru untuk dikirim kembali
        const selectQuery = 'SELECT credits FROM users WHERE deviceId = ?';
        pool.query(selectQuery, [playerId], (selectErr, selectResults) => {
            if (selectErr || selectResults.length === 0) {
                return res.status(500).json({ error: 'Could not retrieve updated credits.' });
            }
            res.json({
                res: true,
                win: win > 0,
                pattern: generateLosingPattern(),
                win_lines: [],
                money: selectResults[0].credits, // Kirim kredit terbaru
                tot_win: win,
            });
        });
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

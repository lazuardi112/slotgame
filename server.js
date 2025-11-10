const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const session = require('express-session');
const { generateRandomSymbols, checkWin, generLosingPattern, PAYTABLE_VALUES, NUM_FREESPIN, BONUS_PRIZE, BONUS_PRIZE_OCCURRENCE, MAX_PRIZES_BONUS, FREESPIN_OCCURRENCE, BONUS_OCCURRENCE } = require('./js/slotUtils');

const app = express();
const port = 5001;

// Middleware untuk mem-parsing body permintaan
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware sesi
app.use(session({
  secret: 'secret-key-for-admin',
  resave: false,
  saveUninitialized: true,
}));

// Menyajikan file statis dari direktori root
app.use(express.static(path.join(__dirname, '/')));
// Menyajikan file admin statis
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Middleware untuk memeriksa apakah pengguna admin telah login
function isAdmin(req, res, next) {
  if (req.session.isAdmin) {
    return next();
  }
  res.redirect('/admin');
}

// Membuat atau membuka database SQLite
const db = new sqlite3.Database('./slot_game.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Terhubung ke database SQLite.');

  // Membuat tabel jika belum ada, dan memulai server HANYA SETELAH selesai
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unique_id TEXT NOT NULL UNIQUE,
      balance INTEGER DEFAULT 10000,
      device_info TEXT,
      total_bet INTEGER DEFAULT 0,
      total_win INTEGER DEFAULT 0
    )`, (err) => { if (err) console.error(err.message); });

    db.run(`CREATE TABLE IF NOT EXISTS game_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      value INTEGER DEFAULT 0
    )`, (err) => { if (err) console.error(err.message); });

    db.run(`CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      value INTEGER
    )`, (err) => { if (err) console.error(err.message); });

    db.run('INSERT OR IGNORE INTO settings (name, value) VALUES (?, ?)', ['target_rtp', 95], (err) => { if (err) console.error(err.message); });
    db.run('INSERT OR IGNORE INTO game_stats (name, value) VALUES (?, ?)', ['total_in', 0], (err) => { if (err) console.error(err.message); });
    db.run('INSERT OR IGNORE INTO game_stats (name, value) VALUES (?, ?)', ['total_out', 0], (err) => {
        if (err) {
            console.error(err.message);
        }
        // Mulai server HANYA SETELAH perintah database terakhir selesai
        app.listen(port, () => {
          console.log(`Server berjalan di http://localhost:${port}`);
        });
    });
  });
});


// Rute API untuk melacak pengguna
app.post('/api/user', (req, res) => {
  const { unique_id, device_info } = req.body;
  if (!unique_id) {
    return res.status(400).send('unique_id diperlukan');
  }

  const query = `
    INSERT INTO users (unique_id, device_info, balance)
    VALUES (?, ?, 10000)
    ON CONFLICT(unique_id)
    DO UPDATE SET device_info = excluded.device_info;
  `;
  db.run(query, [unique_id, device_info], (err) => {
    if (err) {
      console.error('Kesalahan saat menyimpan pengguna:', err);
      return res.status(500).send('Kesalahan server');
    }
    res.status(200).send('Pengguna dilacak');
  });
});

// Rute API untuk mendapatkan saldo pengguna
app.get('/api/user/balance/:unique_id', (req, res) => {
    const { unique_id } = req.params;
    db.get('SELECT balance FROM users WHERE unique_id = ?', [unique_id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Kesalahan server' });
        }
        res.json(row || { balance: 10000 });
    });
});


// Rute API baru untuk menangani logika putaran
app.post('/api/spin', (req, res) => {
    const { unique_id, bet, coin, lines } = req.body;

    db.get('SELECT value FROM settings WHERE name = ?', ['target_rtp'], (err, rtpRow) => {
        db.get('SELECT value FROM game_stats WHERE name = ?', ['total_in'], (err, totalInRow) => {
            db.get('SELECT value FROM game_stats WHERE name = ?', ['total_out'], (err, totalOutRow) => {
                db.get('SELECT balance FROM users WHERE unique_id = ?', [unique_id], (err, user) => {

                    let total_in = totalInRow.value;
                    let total_out = totalOutRow.value;
                    let target_rtp = rtpRow.value;
                    let current_rtp = (total_in > 0) ? (total_out / total_in) * 100 : 0;

                    let win = false;
                    if (current_rtp < target_rtp) {
                        win = Math.random() < 0.5; // 50% chance to win if below target RTP
                    }

                    let win_lines = [];
                    let tot_win = 0;
                    let pattern;

                    if(win){
                        // WIN
                        let bBonus = false;
                        let bFreespin = false;
                        let iRand = Math.floor(Math.random()*100);
                        if(iRand < (FREESPIN_OCCURRENCE + BONUS_OCCURRENCE)){
                             let iRand2 = Math.floor(Math.random()*(FREESPIN_OCCURRENCE+BONUS_OCCURRENCE)+1);
                             if(iRand2 <= FREESPIN_OCCURRENCE){
                                bFreespin = true;
                             } else {
                                bBonus = true;
                             }
                        }

                        pattern = generateRandomSymbols(bFreespin);
                        win_lines = checkWin(bFreespin, lines, pattern);
                        for(var i=0; i<win_lines.length; i++){
                            tot_win += win_lines[i]['amount'];
                        }
                        tot_win *= coin;

                    } else {
                        // LOSE
                        pattern = generLosingPattern();
                    }

                    let new_balance = user.balance - bet + tot_win;

                    db.run('UPDATE users SET balance = ?, total_bet = total_bet + ?, total_win = total_win + ? WHERE unique_id = ?', [new_balance, bet, tot_win, unique_id]);
                    db.run('UPDATE game_stats SET value = value + ? WHERE name = ?', [bet, 'total_in']);
                    db.run('UPDATE game_stats SET value = value + ? WHERE name = ?', [tot_win, 'total_out']);

                    res.json({
                        res: true,
                        win: win,
                        pattern: pattern,
                        win_lines: win_lines,
                        money: new_balance,
                        tot_win: tot_win,
                        freespin: false, // Simplified for now
                        num_freespin: 0,
                        bonus: false,
                        bonus_prize: -1
                    });
                });
            });
        });
    });
});


// Rute login admin
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    req.session.isAdmin = true;
    res.redirect('/admin/dashboard.html');
  } else {
    res.send('Nama pengguna atau kata sandi salah');
  }
});

// Rute dasbor admin
app.get('/admin/dashboard', isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
});

// Rute API untuk mendapatkan semua pemain
app.get('/admin/players', isAdmin, (req, res) => {
  db.all('SELECT * FROM users', (err, rows) => {
    if (err) {
      console.error('Kesalahan saat mengambil pemain:', err);
      return res.status(500).send('Kesalahan server');
    }
    res.json(rows);
  });
});

// Rute API untuk mendapatkan statistik game
app.get('/admin/stats', isAdmin, (req, res) => {
    db.all('SELECT * FROM game_stats', (err, rows) => {
        if(err){
            res.status(500).send(err);
        } else {
            let stats = {};
            rows.forEach(row => {
                stats[row.name] = row.value;
            });
            res.json(stats);
        }
    });
});


// Rute API untuk mendapatkan pengaturan RTP
app.get('/admin/settings/rtp', isAdmin, (req, res) => {
  db.get('SELECT value FROM settings WHERE name = ?', ['target_rtp'], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Kesalahan server');
    }
    res.json(row);
  });
});

// Rute API untuk memperbarui pengaturan RTP
app.post('/admin/settings/rtp', isAdmin, (req, res) => {
  const { value } = req.body;
  db.run('UPDATE settings SET value = ? WHERE name = ?', [value, 'target_rtp'], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Kesalahan server');
    }
    res.sendStatus(200);
  });
});

// Rute API untuk menambah kredit
app.post('/admin/add-credit', isAdmin, (req, res) => {
    const { unique_id, amount } = req.body;
    db.run('UPDATE users SET balance = balance + ? WHERE unique_id = ?', [amount, unique_id], function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Gagal memperbarui kredit.');
        }
        res.status(200).send('Kredit berhasil diperbarui.');
    });
});

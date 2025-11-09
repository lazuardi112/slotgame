const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const session = require('express-session');

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
});

// Membuat tabel jika belum ada
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    unique_id TEXT NOT NULL UNIQUE,
    win_percentage INTEGER,
    credit INTEGER DEFAULT 0
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    value INTEGER
  )`);

  // Memasukkan pengaturan global default jika belum ada
  db.run('INSERT OR IGNORE INTO settings (name, value) VALUES (?, ?)', ['global_win_percentage', 10]);
});


// Rute API untuk melacak pengguna
app.post('/api/user', (req, res) => {
  const { unique_id } = req.body;
  if (!unique_id) {
    return res.status(400).send('unique_id diperlukan');
  }

  const query = 'INSERT OR IGNORE INTO users (unique_id) VALUES (?)';
  db.run(query, [unique_id], (err) => {
    if (err) {
      console.error('Kesalahan saat menyimpan pengguna:', err);
      return res.status(500).send('Kesalahan server');
    }
    res.status(200).send('Pengguna dilacak');
  });
});

// Rute API untuk mendapatkan persentase kemenangan
app.post('/api/win-percentage', (req, res) => {
    const { unique_id } = req.body;
    if (!unique_id) {
        return res.status(400).json({ error: 'unique_id diperlukan' });
    }

    // Pertama, coba dapatkan persentase kemenangan spesifik pengguna
    db.get('SELECT win_percentage FROM users WHERE unique_id = ?', [unique_id], (err, userRow) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Kesalahan server' });
        }

        if (userRow && userRow.win_percentage !== null) {
            return res.json({ value: userRow.win_percentage });
        } else {
            // Jika tidak ada, dapatkan persentase kemenangan global
            db.get('SELECT value FROM settings WHERE name = ?', ['global_win_percentage'], (err, globalRow) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Kesalahan server' });
                }
                res.json(globalRow || { value: 10 }); // Default jika tidak ada
            });
        }
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

// Rute API untuk mendapatkan persentase kemenangan global
app.get('/admin/settings/global-win-percentage', isAdmin, (req, res) => {
  db.get('SELECT value FROM settings WHERE name = ?', ['global_win_percentage'], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Kesalahan server');
    }
    res.json(row);
  });
});

// Rute API untuk memperbarui persentase kemenangan global
app.post('/admin/settings/global-win-percentage', isAdmin, (req, res) => {
  const { value } = req.body;
  db.run('UPDATE settings SET value = ? WHERE name = ?', [value, 'global_win_percentage'], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Kesalahan server');
    }
    res.sendStatus(200);
  });
});

// Rute API untuk memperbarui persentase kemenangan pengguna
app.post('/admin/players/win-percentage', isAdmin, (req, res) => {
  const { unique_id, win_percentage } = req.body;
  db.run('UPDATE users SET win_percentage = ? WHERE unique_id = ?', [win_percentage, unique_id], (err) => {
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
    db.run('UPDATE users SET credit = credit + ? WHERE unique_id = ?', [amount, unique_id], function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Gagal memperbarui kredit.');
        }
        res.status(200).send('Kredit berhasil diperbarui.');
    });
});


app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});

const express = require('express');
const path = require('path');

const app = express();
const port = 5001;

// Sajikan file statis dari direktori root
app.use(express.static(path.join(__dirname, '')));

// Atur rute utama untuk menyajikan index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Mulai server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});

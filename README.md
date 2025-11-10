# Mesin Slot Zeus Treasures

Ini adalah aplikasi mesin slot berbasis web yang dibangun dengan Node.js, Express, Sequelize, dan MySQL. Ini fitur panel admin untuk mengelola pengguna, pengaturan RTP, dan konfigurasi pembayaran.

## Instalasi

1.  **Kloning repositori:**
    ```bash
    git clone https://github.com/nama-pengguna-anda/repositori-anda.git
    cd repositori-anda
    ```

2.  **Instal dependensi:**
    ```bash
    npm install
    ```

3.  **Siapkan database MySQL:**
    *   Buat database baru di MySQL bernama `wagateway`.
    *   Edit file `config/db.js` dengan kredensial database Anda.

4.  **Jalankan migrasi database:**
    ```bash
    npm run db:migrate
    ```

5.  **Konfigurasi Midtrans:**
    *   Dapatkan kunci server Anda dari dasbor Midtrans Anda.
    *   Setelah server berjalan, buka dasbor admin di `/admin` dan navigasikan ke "Pengaturan Midtrans".
    *   Masukkan kunci server Anda, pilih mode produksi/sandbox, dan atur URL notifikasi Anda.

6.  **Mulai server:**
    ```bash
    npm start
    ```

    Server akan berjalan di `http://localhost:5001`.

## Panel Admin

*   **URL:** `/admin`
*   **Nama Pengguna:** `admin`
*   **Kata Sandi:** `admin123`

Dari dasbor admin, Anda dapat:
*   Melihat data pemain.
*   Mengatur RTP global dan per pengguna.
*   Mengonfigurasi pengaturan Midtrans Anda.
*   Menambah atau mengurangi kredit pemain secara manual.

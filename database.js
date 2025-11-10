const mysql = require('mysql2/promise');
const dbConfig = require('./config/db');

let connection;

async function connect() {
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Berhasil terhubung ke database MySQL.');
    } catch (error) {
        console.error('Kesalahan koneksi database:', error.message);
        throw error;
    }
}

function getConnection() {
    return connection;
}

module.exports = {
    connect,
    getConnection
};

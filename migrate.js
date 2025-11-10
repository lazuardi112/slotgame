const mysql = require('mysql2');
const config = require('./config/config.js');

// Connection configuration without a specific database
const initialConnection = mysql.createConnection({
  host: config.host,
  user: config.user,
  password: config.password
});

// Connect to MySQL server to create the database
initialConnection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL server.');

  initialConnection.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\``, (err, results) => {
    if (err) {
      console.error('Error creating database:', err);
      initialConnection.end();
      return;
    }
    console.log('Database created or already exists.');
    initialConnection.end();

    // Now connect to the newly created database to create the table
    const dbConnection = mysql.createConnection(config);
    dbConnection.connect((err) => {
      if (err) {
        console.error('Error connecting to the database:', err);
        return;
      }
      console.log('Connected to the database.');

      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          deviceId VARCHAR(255) NOT NULL UNIQUE,
          credits INT NOT NULL DEFAULT 10000,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      dbConnection.query(createTableQuery, (err, results) => {
        if (err) {
          console.error('Error creating table:', err);
        } else {
          console.log('Table "users" is ready.');
        }
        dbConnection.end();
      });
    });
  });
});

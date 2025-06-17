// src/database/db.js
const { Pool } = require('pg');

// PostgreSQL connection pool
const pool = new Pool({
    host: '192.168.1.225',  // IP address of your PostgreSQL server
    // TODO: change host to 'localhost' above before moving the website to linux server!
    port: 5432,             // Default PostgreSQL port
    database: 'kingmaker', // Your database name - you'll need to create this
    user: 'zook',           // PostgreSQL username
    password: 'Ke90*gay312!' // PostgreSQL password
});

// Test the connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Could not connect to PostgreSQL database', err);
    } else {
        console.log('Connected to PostgreSQL database at:', res.rows[0].now);
    }
});

// force using the kingmaker search path
pool.query('SET search_path to kingmaker', (err) => {
    if (err) {
        console.error('Error setting search path:', err);
    } else {
        console.log('Search path set to kingmaker schema');
    }
})

// Get database connection
function getConnection() {
    return pool;
}

// Export functions for use in other files
module.exports = {
    getConnection
};
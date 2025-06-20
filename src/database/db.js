// src/database/db.js
require('dotenv').config();
const { Pool } = require('pg');

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error('Missing required environment variables:', missingEnvVars.join(', '));
    process.exit(1);
}

// PostgreSQL connection pool
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
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
const schema = process.env.DB_SCHEMA || 'kingmaker';
pool.query(`SET search_path to ${schema}`, (err) => {
    if (err) {
        console.error('Error setting search path:', err);
    } else {
        console.log(`Search path set to ${schema} schema`);
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
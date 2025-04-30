const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database file will be stored in the project root
const dbPath = path.join(__dirname, '../../pathfinder.db');

// Get database connection
function getConnection() {
    return new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Could not connect to database', err);
        } else {
            console.log('Connected to SQLite database');
        }
    });
}

// Initialize database with tables
async function initializeDatabase() {
    return new Promise((resolve, reject) => {
        const db = getConnection();

        // Create users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      is_dm BOOLEAN DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
            if (err) {
                reject(err);
                return;
            }

            // Create hexes table for map data
            db.run(`CREATE TABLE IF NOT EXISTS hexes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        x_coord INTEGER NOT NULL,
        y_coord INTEGER NOT NULL,
        terrain_type TEXT,
        name TEXT,
        notes TEXT,
        is_explored BOOLEAN DEFAULT 0,
        controlled_by TEXT,
        resources TEXT,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(x_coord, y_coord)
      )`, (err) => {
                if (err) {
                    reject(err);
                    return;
                }

                // Close the database connection
                db.close((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        });
    });
}

// Export functions for use in other files
module.exports = {
    getConnection,
    initializeDatabase
};
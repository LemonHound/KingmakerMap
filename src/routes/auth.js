const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getConnection } = require('../database/db');

const router = express.Router();

// JWT secret key (in production, this would be in an environment variable)
const JWT_SECRET = 'pathfinder-campaign-secret-key';

// Register a new user
router.post('/register', async (req, res) => {
    const { username, password, isDM } = req.body;

    // Basic validation
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const db = getConnection();

        // Check if user already exists
        db.get('SELECT id FROM users WHERE username = ?', [username], async (err, user) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (user) {
                return res.status(409).json({ error: 'Username already taken' });
            }

            // Hash the password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Insert the new user
            db.run(
                'INSERT INTO users (username, password, is_dm) VALUES (?, ?, ?)',
                [username, hashedPassword, isDM ? 1 : 0],
                function(err) {
                    if (err) {
                        console.error('Error creating user:', err);
                        return res.status(500).json({ error: 'Failed to create user' });
                    }

                    // Generate JWT token
                    const token = jwt.sign(
                        {
                            userId: this.lastID,
                            username,
                            isDM: isDM ? true : false
                        },
                        JWT_SECRET,
                        { expiresIn: '7d' } // Token expires in 7 days
                    );

                    res.status(201).json({
                        message: 'User registered successfully',
                        token,
                        user: {
                            id: this.lastID,
                            username,
                            isDM: isDM ? true : false
                        }
                    });
                }
            );
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login user
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Basic validation
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const db = getConnection();

        // Find user by username
        db.get(
            'SELECT username, password, is_dm FROM users WHERE username = ?',
            [username],
            async (err, user) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Internal server error' });
                }

                if (!user) {
                    return res.status(401).json({ error: 'Invalid credentials' });
                }

                // Compare passwords
                const passwordMatch = await bcrypt.compare(password, user.password);

                if (!passwordMatch) {
                    return res.status(401).json({ error: 'Invalid credentials' });
                }

                // Generate JWT token
                const token = jwt.sign(
                    {
                        username: user.username,
                        isDM: user.is_dm === 1
                    },
                    JWT_SECRET,
                    { expiresIn: '7d' } // Token expires in 7 days
                );

                res.json({
                    message: 'Login successful',
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        isDM: user.is_dm === 1
                    }
                });
            }
        );
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Verify token endpoint
router.get('/verify', (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        res.json({
            valid: true,
            user: {
                id: decoded.userId,
                username: decoded.username,
                isDM: decoded.isDM
            }
        });
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ error: 'Invalid token', valid: false });
    }
});

module.exports = router;
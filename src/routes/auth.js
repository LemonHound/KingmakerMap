// src/routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getConnection } = require('../database/db');
const { getUsers, createUser, getMap, getUserMapLink} = require('../utils/queryUtils');
// Replace ES imports with CommonJS requires
const apiUtils = require('../../public/js/utils/apiUtils');

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
        const existingUser = await getUsers(username);

        if (existingUser && existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'Username already taken' });
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert the new user
        const result = await createUser(username, hashedPassword, isDM);
        const newUserID = result.rows[0].person_id;

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: newUserID,
                username,
                isDM: !!isDM
            },
            JWT_SECRET,
            { expiresIn: '7d' } // Token expires in 7 days
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: newUserID,
                username,
                isDM: !!isDM
            }
        });
    } catch (error) {
        console.error('Registration error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            code: error.code
        });
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Basic validation
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const db = getConnection();

        // Find user by username
        const result = await getUsers(username);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Compare passwords
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user.person_id,
                username: user.username,
                isDM: user.is_dm
            },
            JWT_SECRET,
            { expiresIn: '7d' } // Token expires in 7 days
        );

        // Get the map, add to the returned payload
        const map = await getUserMapLink(user.person_id, true);
        const map_id = map.rows[0].map_id;

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.person_id,
                username: user.username,
                isDM: user.is_dm
            },
            map: {
                map_id: map_id
            }
        });
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
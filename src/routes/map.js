const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getConnection } = require('../database/db');

const router = express.Router();

// JWT secret key (in production, this would be in an environment variable)
const JWT_SECRET = 'pathfinder-campaign-secret-key';

router.post('/update', async (req, res) => {

    const db = getConnection();

    try{
        // complete and close connection for now
        res.json({message: 'Map API working!'});
    } catch (error){
        console.error('Error Updating Map:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        db.close((err) => {
            if (err){
                console.error('Error closing database connection: ', err);
            }
        })
    }
});

// export the router
module.exports = router;
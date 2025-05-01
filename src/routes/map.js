const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getConnection } = require('../database/db');
const { getQuery, replaceQueryParams, executeQuery } = require('../utils/queryUtils');

const router = express.Router();

// JWT secret key (in production, this will be in an environment variable)
const JWT_SECRET = 'pathfinder-campaign-secret-key';

router.post('/create', async (req, res) => {
    const db = getConnection();

    try{
        let query = await getQuery('getMap');
        query = replaceQueryParams(query, {
            TestInput: 'test123'
        });
        const result = await executeQuery(db, query);
        res.json({
            data: result[0] ? Object.values(result[0])[0] : null
        });
    } catch (e){
        console.error('Error Writing Map:', e);
        res.status(500).json({ error: 'Internal server error' });
    }finally {
        db.close((e) => {
            if (e){
                console.error('Error closing database connection: ', e);
            }
        })
    }
});

router.post('/update', async (req, res) => {
    const db = getConnection();

    try{
        res.json({message: 'Map API working!'});
    } catch (e){
        console.error('Error Updating Map:', e);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        db.close((e) => {
            if (e){
                console.error('Error closing database connection: ', e);
            }
        })
    }
});

router.post('/get_map', async (req, res) => {
    const db = getConnection();

    try{

    } catch (e){
        console.error('Error Fetching Map:', e);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        db.close((e) => {
            if (e){
                console.error('Error closing database connection: ', e);
            }
        })
    }
});

router.post('/test', async (req, res) => {
    const db = getConnection();

    try {
        const { TestInput } = req.body;
        const query = await getQuery('getMap');
        const preparedQuery = replaceQueryParams(query, { TestInput });
        const result = await executeQuery(db, preparedQuery);

        res.json({
            data: result[0] ? Object.values(result[0])[0] : 'no data',
            originalParameter: TestInput
        });
    } catch (e) {
        console.error('Error Testing Query:', e);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        db.close((e) => {
            if (e) {
                console.error('Error closing database connection: ', e);
            }
        })
    }
});


module.exports = router;
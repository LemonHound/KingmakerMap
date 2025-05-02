const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getConnection } = require('../database/db');
const { getQuery, replaceQueryParams, executeQuery } = require('../utils/queryUtils');
const repl = require("node:repl");

const router = express.Router();

// JWT secret key (in production, this will be in an environment variable)
const JWT_SECRET = 'pathfinder-campaign-secret-key';

router.post('/create', async (req, res) => {
    const db = getConnection();

    try {
        // Extract map data from the request body
        const { hexes, config, name, lastUpdated } = req.body;

        // Validate that required data is present
        if (!hexes || !config) {
            return res.status(400).json({ error: 'Missing required map data' });
        }

        // Convert map data to JSON string for storage
        const mapData = JSON.stringify({
            hexes,
            config,
            name: name || null,
            lastUpdated: lastUpdated || new Date().toISOString()
        });

        // Get the create map query
        let mapQuery = await getQuery('createMap');
        let userMapLinkQuery = await getQuery('createUserMapLink');

        // Replace parameters for map query
        mapQuery = replaceQueryParams(mapQuery, {
            mapData,
            createdAt: new Date().toISOString(),
            userId: req.user ? req.user.id : null
        });

        // Execute the query
        const mapResult = await executeQuery(db, mapQuery);

        // replace userMapLink query parameters
        userMapLinkQuery = replaceQueryParams(userMapLinkQuery, {
            username: req.user ? req.user.username : null,
            map_id: mapResult ? mapResult.map_id : null
        });

        // Add user map link record
        await executeQuery(db, userMapLinkQuery);

        // Send back the newly created map ID and success message
        res.status(201).json({
            message: 'Map created successfully',
            id: mapResult && mapResult[0] ? mapResult[0].id : null,
            data: mapResult
        });

    } catch (e) {
        console.error('Error creating map:', e);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        db.close((e) => {
            if (e) {
                console.error('Error closing database connection: ', e);
            }
        });
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
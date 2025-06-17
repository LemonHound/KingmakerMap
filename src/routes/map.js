const {getPersonIDFromUsername} = require('../utils/queryUtils')

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {createMap, updateMap, createHex, getHex, createUserMapLink, getMap} = require('../utils/queryUtils');

const router = express.Router();

// JWT secret key (in production, this will be in an environment variable)
const JWT_SECRET = 'pathfinder-campaign-secret-key';

router.post('/create', async (req, res) => {

    try {
        // Extract map data from the request body
        const { config, username, hexMap } = req.body;

        // Validate that required data is present
        if (!hexMap || !config || !username) {
            return res.status(400).json({ error: 'Missing required data' });
        }

        const mapResult = await createMap(
            config.name,
            config.cols,
            config.rows,
            config.hexScale,
            config.imageScale,
            config.imageScaleHorizontal,
            config.imageScaleVertical,
            config.offsetX,
            config.offsetY);
        const mapId = mapResult.rows[0].map_id;

        // Create user map link
        const personId = await getPersonIDFromUsername(username);
        await createUserMapLink(personId, mapId);

        // Create hex data
        for(let i = 0; i < hexMap.length; i++) {
            for(let j = 0; j < hexMap[i].length; j++) {
                await createHex(
                    mapId,
                    hexMap[i][j].name,
                    hexMap[i][j].x,
                    hexMap[i][j].y,
                    hexMap[i][j].isExplored,
                    hexMap[i][j].isControlled,
                    hexMap[i][j].resources,
                    hexMap[i][j].notes,
                    hexMap[i][j].isVisible
                )
            }
        }

        // Send back the newly created map ID and success message
        res.status(201).json({
            message: 'Map created successfully',
            id: mapId,
            data: mapResult.rows[0]
        });

    } catch (e) {
        console.error('Error creating map:', e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/update', async (req, res) => {
    try {
        const {id, config} = req.body;
        console.log('config: ', config);
        const result = await updateMap(
            id,
            config.name,
            config.offsetX,
            config.offsetY,
            config.hexScale,
            config.imageScale,
            config.imageScaleHorizontal,
            config.imageScaleVertical,
            config.rows,
            config.cols
        );
        res.status(200).json({
            message: 'Map updated successfully',
            mapID: result
        });
    } catch (e) {
        console.error('Error Updating Map:', e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/get_map', async (req, res) => {
    try {
        const {id} = req.body;
        const result = await getMap(id);
        res.status(200).json({
            message: 'Map retrieved successfully',
            data: result.rows[0]
        });
    } catch (e) {
        console.error('Error Fetching Map:', e);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;
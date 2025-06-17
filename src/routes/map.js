const {getPersonIDFromUsername} = require('../utils/queryUtils')

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {createMap, updateMap, createHex, updateHex, getHexesByMapID, createUserMapLink, getMap} = require('../utils/queryUtils');

const router = express.Router();

// JWT secret key (in production, this will be in an environment variable)
const JWT_SECRET = 'pathfinder-campaign-secret-key';

router.post('/create_map', async (req, res) => {

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

router.post('/update_map', async (req, res) => {
    try {
        const {id, config} = req.body;
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

router.post('/get_hexes_by_map_id', async (req, res) => {
    try{
        const {mapID} = req.body;
        const result = await getHexesByMapID(mapID);
        res.status(200).json({
            message: 'Map retrieved successfully',
            data: result
        });

    } catch (e){
        console.error('Error Fetching Map:', e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/update_hex', async (req, res) => {
   try{
       const {mapID,
           x,
           y,
           name,
           isExplored,
           isControlled,
           isVisible,
           resources,
           notes} = req.body;
       const result = await updateHex(mapID, x, y, name, isExplored, isControlled, isVisible, resources, notes);
       res.status(200).json({
          message: 'Hex updated successfully',
          data: result
       });
   } catch (e){
       console.error('Error Fetching Map:', e);
       res.status(500).json({ error: 'Internal server error' });
   }
});

router.post('/create_hex', async (req, res) => {
    try{
        const {mapID,
            x,
            y,
            name,
            isExplored,
            isControlled,
            isVisible,
            resources,
            notes} = req.body;
        const result = await createHex(mapID, name, x, y, isExplored, isControlled, isVisible, resources, notes);

        // map_id, hex_name, x_coord, y_coord, is_explored, is_controlled, resource_json, notes, isVisible
        res.status(200).json({
            message: 'Hex updated successfully',
            data: result
        });
    } catch (e){
        console.error('Error Fetching Map:', e);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;
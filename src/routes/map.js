const {getPersonIDFromUsername} = require('../utils/queryUtils')

const express = require('express');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
const {createMap,
    updateMap,
    createHex,
    updateHex,
    getHexesByMapID,
    createUserMapLink,
    getMap,
    getHexNotes,
    addNoteToHex,
    getPersonFromID,
    getMapLink,
    updateHexName,
    getHexDetails,
    updateHexVisibility,
    updateHexExplored,
    updateHexControlled,
    getPersonDetails,
    createMapLink
} = require('../utils/queryUtils');
// const {json} = require("express");

const router = express.Router();

// JWT secret key (in production, this will be in an environment variable)
// const JWT_SECRET = 'pathfinder-campaign-secret-key';

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
        console.error('Error updating map:', e);
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
        console.error('Error fetching map:', e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/get_map_link', async (req, res) => {
    try{
        const {mapID} = req.body;
        const result = await getMapLink(mapID);
        res.status(200).json({
           message: 'Map link retrieved successfully',
           data: result
        });
    } catch(e){
        console.error('Error getting map_link:', e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/create_map_link', async(req, res) => {
   try{
       const {mapID} = req.body;
       const result = await createMapLink(mapID);
       res.status(200).json({
           message: 'Map link generated successfully',
           data: result
       });
   } catch(e){
       console.error('Error generating map_link:', e);
       res.status(500).json({error: 'Internal server error'});
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
        console.error('Error fetching hexes:', e);
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
           isVisible} = req.body;
       const result = await updateHex(mapID, x, y, name, isExplored, isControlled, isVisible);
       res.status(200).json({
          message: 'Hex updated successfully',
          data: result
       });
   } catch (e){
       console.error('Error updating hex:', e);
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
        res.status(200).json({
            message: 'Hex updated successfully',
            data: result
        });
    } catch (e){
        console.error('Error creating hex:', e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/get_hex_notes', async (req, res) => {
    try{
        const {x, y, mapID} = req.body;
        const result = await getHexNotes(x, y, mapID);
        res.status(200).json({
            message: 'Hex notes retrieved successfully',
            data: result
        });
    } catch (e){
    console.error('Error fetching hex notes:', e);
    res.status(500).json({ error: 'Internal server error' });
}
});

router.post('/add_note_to_hex', async (req, res) => {
   try{
       const{x, y, mapID, personID, text} = req.body;
       const result = await addNoteToHex(x, y, mapID, personID, text);
       res.status(200).json({
          message: 'Note added to hex',
          data: result
       });
   } catch (e){
       console.error('Error adding note to hex:', e);
       res.status(500).json({ error: 'Internal server error' });
   }
});

router.post('/get_person_from_id', async (req, res) => {
    try{
        const{person_id} = req.body;
        const result = await getPersonFromID(person_id);
        res.status(200).json({
            message: 'Person details retrieved successfully',
            data: result
        });
    } catch (e){
        console.error('Error getting person details:', e);
        res.status(500).json({error: 'Internal server error'});
    }
});

router.post('/get_person_details', async(req, res) => {
    try{
       const{username} = req.body;
       const result = await getPersonDetails(username);
       res.status(200).json({
          message: 'person details retrieved successfully',
          data: result
       });
   } catch(e){
       console.error('Error getting person details:', e);
       res.status(500).json({error: 'Internal server error'});
   }
});

router.post('/update_hex_name', async (req, res) => {
   try{
       const{x, y, mapID, newName} = req.body;
       const result = await updateHexName(x, y, mapID, newName);
       res.status(200).json({
          message: 'Hex name updated successfully',
          data: result
       });
   } catch(e){
       console.error('Error updating hex name:', e);
       res.status(500).json({ error: 'Internal server error' });
   }
});

router.post('/get_hex_details', async (req, res) => {
    try{
        const {x, y, mapID} = req.body;
        const result = await getHexDetails(x, y, mapID);
        res.status(200).json({
           message: 'Hex details retrieved',
           data: result
        });
    } catch(e){
        console.error('Error fetching hex details:', e);
        res.status(500).json({error: 'Internal server error'});
    }
});

router.post('/update_hex_visibility', async (req, res) => {
   try{
       const{x, y, mapID, isVisible} = req.body;
       const result = await updateHexVisibility(x, y, mapID, isVisible);
       res.status(200).json({
          message: 'Hex visibility updated successfully',
          data: result
       });
   } catch(e){
       console.error('Error updating hex visibility:', e);
       res.status(500).json({ error: 'Internal server error' });
   }
});

router.post('/update_hex_explored', async (req, res) => {
   try{
       const{x, y, mapID, isExplored} = req.body;
       const result = await updateHexExplored(x, y, mapID, isExplored);
       res.status(200).json({
          message: 'Hex explored status updated successfully',
          data: result
       });
   } catch(e){
       console.error('Error updating hex exploration status', e);
       res.status(500).json({error: 'Internal server error'});
   }
});

router.post('/update_hex_controlled', async(req, res)=> {
   try{
       const{x, y, mapID, isControlled} = req.body;
       const result = await updateHexControlled(x, y, mapID, isControlled);
       res.status(200).json({
          message: 'Hex controlled status updated successfully',
          data: result
       });
   } catch(e){
       console.error('Error updating hex controlled status', e);
       res.status(500).json({error: 'Internal server error'});
   }
});


module.exports = router;
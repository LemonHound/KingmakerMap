// src/utils/queryUtils.js
const fs = require('fs').promises;
const path = require('path');
const {getConnection} = require("../database/db");

/**
 * Retrieve a query from a file
 * @param {String} queryName - Name of the query file (without .sql extension)
 * @returns {Promise<String>} The query string
 */
const getQuery = async (queryName) => {
    try {
        const queryPath = path.join(__dirname, '../database/queries', `${queryName}.sql`);
        const query = await fs.readFile(queryPath, 'utf8');
        return query;
    } catch (error) {
        throw new Error(`Failed to load query '${queryName}': ${error.message}`);
    }
};

/**
 * get user by username
 * @param username
 * @return {Promise<*>}
 */
const getUsers = async(username) => {
    try{
        const db = getConnection();

        const query = await getQuery('getPerson');
        return await db.query(query, [username]);
    } catch (error) {
        throw new Error(`Failed to load users: ${error.message}`);
    }
}

const getPersonIDFromUsername = async(username) => {
    try{
        const db = getConnection();
        const query = await getQuery('getPersonIDFromUsername');
        const result = await db.query(query, [username]);
        return result.rows[0].person_id;
    } catch (error) {
        throw new Error(`Failed to load users: ${error.message}`);
    }
}

/**
 * Create a user
 * @param username
 * @param password
 * @param is_dm
 * @param map_id
 * @return {Promise<*>}
 */
const createUser = async(username, password, is_dm, map_id) => {
    try{
        const db = getConnection();
        const createUserQuery = await getQuery('createPerson');
        const createEmptyMapquery = await getQuery('createEmptyMap');
        const createMapLinkQuery = await getQuery('createUserMapLink');
        const userResults = await db.query(createUserQuery, [username, password, is_dm]);
        if(map_id !== null){
            // non-DM with map_id attempting to register
            await db.query(createMapLinkQuery, [userResults.rows[0].person_id, map_id]);
            userResults.rows[0].mapID = map_id;
        } else {
            // DM attempting to register
            const newMapData = await db.query(createEmptyMapquery);
            const newMapID = newMapData.rows[0].map_id;
            await db.query(createMapLinkQuery, [userResults.rows[0].person_id, newMapID]);
            userResults.rows[0].mapID = newMapID;
        }
        return userResults;
    } catch (error) {
        console.error('Failed to create user:', {
            error: error.message,
            code: error.code,
            detail: error.detail,
            stack: error.stack
        });
        throw new Error(`Failed to create user: ${error.message}`);
    }
}


/**
 * @param name
 * @param col_count
 * @param row_count
 * @param hex_scale
 * @param image_scale
 * @param image_scale_horizontal
 * @param image_scale_vertical
 * @param offset_x
 * @param offset_y
 * @return {Promise<*>}
 */
const createMap = async(name, col_count, row_count, hex_scale, image_scale, image_scale_horizontal, image_scale_vertical, offset_x, offset_y) => {
    try {
        const db = getConnection();
        const query = await getQuery('createMap');
        return await db.query(query, [name, col_count, row_count, hex_scale, image_scale, image_scale_horizontal, image_scale_vertical, offset_x, offset_y]);
    } catch (e){
        console.error('Failed to save map:', {
            error: e.message,
            code: e.code,
            detail: e.detail,
            stack: e.stack
        });
        throw new Error(`Failed to save map: ${e.message}`);
    }
}

/**
 * update an existing map
 * @param id - the existing map_id value
 * @param name
 * @param offset_x
 * @param offset_y
 * @param hex_scale
 * @param image_scale
 * @param image_scale_horizontal
 * @param image_scale_vertical
 * @param row_count
 * @param col_count
 * @return {Promise<*>}
 */
const updateMap = async(id, name, offset_x, offset_y, hex_scale, image_scale, image_scale_horizontal, image_scale_vertical, row_count, col_count) => {
    try {
        const db = getConnection();
        const query = await getQuery('updateMap');
        const result = await db.query(query, [id, name, offset_x, offset_y, hex_scale, image_scale, image_scale_horizontal, image_scale_vertical, row_count, col_count]);
        return result.rows[0].map_id;
    } catch (e){
        console.error('Failed to save map:', {
            error: e.message,
            code: e.code,
            detail: e.detail,
            stack: e.stack
        });
        throw new Error(`Failed to save map: ${e.message}`);
    }
}

/**
 * @param map_id
 * @return {Promise<*>}
 */
const getMap = async(map_id) => {
    try {
        const db = getConnection();
        const query = await getQuery('getMap');
        return await db.query(query, [map_id]);
    } catch (e){
        console.error('Failed to load map:', {
            error: e.message,
            code: e.code,
            detail: e.detail,
            stack: e.stack
        });
        throw new Error(`Failed to load map: ${e.message}`);
    }
}

const getMapLink = async(map_id) => {
    try{
        console.log('map id: ', map_id);
        const db = getConnection();
        const query = await getQuery('getMapLink');
        return await db.query(query, [map_id])
    } catch(e){
        console.error('Failed to retrieve map link:', {
            error: e.message,
            code: e.code,
            detail: e.detail,
            stack: e.stack
        });
        throw new Error(`Failed to retrieve map link: ${e.message}`);
    }
}

const createMapLink = async(mapID) => {
    try {
        const db = getConnection();
        const query = await getQuery('createMapLink');
        return await db.query(query, [mapID]);
    } catch(e){
        console.error('Failed to generate map link:', {
            error: e.message,
            code: e.code,
            detail: e.detail,
            stack: e.stack
        });
        throw new Error(`Failed to generate map link: ${e.message}`);
    }
}

/**
 * @param person_id
 * @param map_id
 * @return {Promise<*>}
 */
const createUserMapLink = async(person_id, map_id) => {
    try{
        const db = getConnection();
        const query = await getQuery('createUserMapLink');
        return await db.query(query, [person_id, map_id]);
    }catch(e){
        console.error('Failed to link user to map:', {
            error: e.message,
            code: e.code,
            detail: e.detail,
            stack: e.stack
        });
        throw new Error(`Failed to link user to map: ${e.message}`);
    }
}

/**
 * @param value - Person ID or Map ID
 * @param bSearchByPersonID - bool indicating whether the first value is person_id or map_id
 * @return {Promise<*>}
 */
const getUserMapLink = async(value, bSearchByPersonID) => {
    try{
        const db = getConnection();
        if(bSearchByPersonID){
            const query = await getQuery('getMapFromPerson');
            return await db.query(query, [value]);
        }else {
            const query = await getQuery('getPersonFromMap');
            return await db.query(query, [value]);
        }
    } catch (e){
        console.error('Failed to get user map link:', {
            error: e.message,
            code: e.code,
            detail: e.detail,
            stack: e.stack
        });
        throw new Error(`Failed to get user map link: ${e.message}`);
    }
}

/**
 * Create a hex
 * @param map_id
 * @param hex_name
 * @param x_coord
 * @param y_coord
 * @param is_explored
 * @param is_controlled
 * @param resource_json
 * @param notes
 * @param isVisible
 * @return {Promise<*>}
 */
const createHex = async(map_id, hex_name, x_coord, y_coord, is_explored, is_controlled, isVisible, resource_json) => {
    try{
        const db = getConnection();
        const query = await getQuery('createHex');
        return await db.query(query, [map_id, hex_name, x_coord, y_coord, is_explored, is_controlled, isVisible, resource_json])
    } catch (e) {
        console.error('Failed to create hex:', {
            error: e.message,
            code: e.code,
            detail: e.detail,
            stack: e.stack
        });
        throw new Error(`Failed to create hex: ${e.message}`);
    }
}

/**
 * Updates an existing hex
 * @param hex_id
 * @param map_id
 * @param x_coord
 * @param y_coord
 * @param hex_name
 * @param is_explored
 * @param is_controlled
 * @param is_visible
 * @param resources
 * @param notes
 * @return {Promise<*>}
 */
const updateHex = async(map_id,
                        x_coord,
                        y_coord,
                        hex_name,
                        is_explored,
                        is_controlled,
                        is_visible) => {
    try{
        const db = getConnection();
        const query = await getQuery('updateHex');
        return await db.query(query, [
            map_id,
            x_coord,
            y_coord,
            hex_name,
            is_explored,
            is_controlled,
            is_visible])
    } catch (e) {
        console.error('Failed to create hex:', {
            error: e.message,
            code: e.code,
            detail: e.detail,
            stack: e.stack
        });
        throw new Error(`Failed to create hex: ${e.message}`);
    }
}

const getHexByID = async(hex_id, mapID) => {
    try {
        const db = getConnection();
        const query = await getQuery('getHexByID');
        return await db.query(query, [hex_id, mapID]);
    } catch (e){
        console.error('Failed to get hex:', {
            error: e.message,
            code: e.code,
            detail: e.detail,
            stack: e.stack
        });
        throw new Error(`Failed to get hex: ${e.message}`);
    }
}

const getHexByCoord = async(x, y, mapID) => {
    try {
        const db = getConnection();
        const query = await getQuery('getHexByCoord');
        return await db.query(query, [x, y, mapID]);
    } catch (e){
        console.error('Failed to get hex:', {
            error: e.message,
            code: e.code,
            detail: e.detail,
            stack: e.stack
        });
        throw new Error(`Failed to get hex: ${e.message}`);
    }
}

const getHexesByMapID = async(map_id) => {
    try {
        const db = getConnection();
        const query = await getQuery('getHexesByMapID');
        return await db.query(query, [map_id]);
    } catch (e){
        console.error('Failed to get hex:', {
            error: e.message,
            code: e.code,
            detail: e.detail,
            stack: e.stack
        });
        throw new Error(`Failed to get hex: ${e.message}`);
    }
}

const getHexNotes = async(x, y, mapID) => {
    try{
        const db = getConnection();
        const query = await getQuery('getHexNotes');
        return await db.query(query, [x, y, mapID]);
    } catch(e){
        console.error('Failed to get hex notes:', {
            error: e.message,
            code: e.code,
            detail: e.detail,
            stack: e.stack
        });
        throw new Error(`Failed to get hex notes: ${e.message}`);
    }
}

const addNoteToHex = async(x, y, mapID, personID, text) => {
    try{
        const db = getConnection();
        const query = await getQuery('addNoteToHex');
        return await db.query(query, [x, y, mapID, personID, text]);
    } catch(e){
        console.error('Failed to add note to hex:', {
            error: e.message,
            code: e.code,
            detail: e.detail,
            stack: e.stack
        });
        throw new Error(`Failed to get hex notes: ${e.message}`);
    }
}

const getPersonFromID = async(person_id) => {
    try{
        const db = getConnection();
        const query = await getQuery('getPersonFromID');
        return await db.query(query, [person_id]);
    } catch(e){
        console.error('Failed to get person details for person id:', person_id, {
            error: e.message,
            code: e.code,
            detail: e.detail,
            stack: e.stack
        });
        throw new Error(`Failed to get person details: ${e.message}`);
    }
}

const getPersonDetails = async(username) => {
    try{
        const db = getConnection();
        const query = await getQuery('getPerson');
        return await db.query(query, [username]);
    } catch(e){
        console.error('Failed to get person details for username:', username, {
            error: e.message,
            code: e.code,
            detail: e.detail,
            stack: e.stack
        });
        throw new Error(`Failed to get person details: ${e.message}`);
    }
}

const updateHexName = async(x, y, mapID, newName) => {
    try{
        const db = getConnection();
        const query = await getQuery('updateHexName');
        return await db.query(query, [x, y, mapID, newName]);
    } catch(e){
        console.error('Failed to update hex name: (', x,', ', y, '), ', {
            error: e.message,
            code: e.code,
            detail: e.detail,
            stack: e.stack
        });
        throw new Error(`Failed to get person details: ${e.message}`);
    }
}

const getHexDetails = async(x, y, mapID) => {
    try{
        const db = getConnection();
        const query = await getQuery('getHexDetails');
        return await db.query(query, [x, y, mapID]);
    } catch(e){
        console.error('Failed to get hex details: (', x, ', ', y, '), ', {
            error: e.message,
            code: e.code,
            detail: e.detail,
            stack: e.stack
        });
    }
}

const updateHexVisibility = async(x, y, mapID, isVisible) => {
    try{
        const db = getConnection();
        const query = await getQuery('updateHexVisibility');
        return await db.query(query, [x, y, mapID, isVisible]);
    } catch(e){
        console.error('Failed to update visibility for (', x, ', ', y, '), ', {
            error: e.message,
            code: e.code,
            detail: e.detail,
            stack: e.stack
        });
    }
}

const updateHexExplored = async(x, y, mapID, isExplored) => {
    try{
        const db = getConnection();
        const query = await getQuery('updateHexExplored');
        return await db.query(query, [x, y, mapID, isExplored]);
    } catch(e){
        console.error('Failed to update explored status', {
            error: e.message,
            code: e.code,
            detail: e.detail,
            stack: e.stack
        });
    }
}

const updateHexControlled = async(x, y, mapID, isControlled) => {
    try{
        const db = getConnection();
        const query = await getQuery('updateHexControlled');
        return await db.query(query, [x, y, mapID, isControlled]);
    } catch(e){
        console.error('Failed to update controlled status', {
            error: e.message,
            code: e.code,
            detail: e.detail,
            stack: e.stack
        });
    }
}

const getMapFromDMLink = async(dmLink) => {
    try{
        const db = getConnection();
        const query = await getQuery('getMapIDFromDMLink');
        return await db.query(query, [dmLink]);
    } catch(e){
        console.error('Invalid DM Link', {
            error: e.message,
            code: e.code,
            detail: e.detail,
            stack: e.stack
        });
    }
}

module.exports = {
    getUsers,
    createUser,
    createMap,
    getMap,
    createHex,
    updateHex,
    getHexByID,
    getHexByCoord,
    getHexesByMapID,
    getHexNotes,
    createUserMapLink,
    getUserMapLink,
    getPersonIDFromUsername,
    updateMap,
    addNoteToHex,
    getPersonFromID,
    getMapLink,
    updateHexName,
    getHexDetails,
    updateHexVisibility,
    updateHexExplored,
    updateHexControlled,
    getMapFromDMLink,
    getPersonDetails,
    createMapLink
};
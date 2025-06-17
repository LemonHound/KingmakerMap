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
        console.log('result: ', result.rows[0].person_id);
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
 * @return {Promise<*>}
 */
const createUser = async(username, password, is_dm) => {
    try{
        const db = getConnection();

        const query = await getQuery('createPerson');
        return await db.query(query, [username, password, is_dm]);
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
    console.log("queryUtils/getMap()");
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
const createHex = async(map_id, hex_name, x_coord, y_coord, is_explored, is_controlled, isVisible, resource_json, notes) => {
    try{
        const db = getConnection();
        const query = await getQuery('createHex');
        return await db.query(query, [map_id, hex_name, x_coord, y_coord, is_explored, is_controlled, isVisible, resource_json, notes])
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
                        is_visible,
                        resources,
                        notes) => {
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
            is_visible,
            resources,
            notes])
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

const getHexByID = async(hex_id) => {
    try {
        const db = getConnection();
        const query = await getQuery('getHex');
        return await db.query(query, [hex_id]);
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

const getHexByCoord = async(x, y) => {
    try {
        const db = getConnection();
        const query = await getQuery('getHex');
        return await db.query(query, [x, y]);
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
    createUserMapLink,
    getUserMapLink,
    getPersonIDFromUsername,
    updateMap
};
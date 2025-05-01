// src/utils/queryUtils.js
// Full file contents

const fs = require('fs').promises;
const path = require('path');

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
 * Replace parameters in a query string
 * @param {String} query - Query string with parameters in $_param$_ format
 * @param {Object} params - Object with parameter names and values
 * @returns {String} Query with parameters replaced
 */
const replaceQueryParams = (query, params) => {
    let replacedQuery = query;

    for (const [param, value] of Object.entries(params)) {
        const paramPattern = new RegExp(`\\$_${param}\\$_`, 'g');

        // Convert value to string and escape single quotes for SQL
        const safeValue = typeof value === 'string'
            ? `${value.replace(/'/g, "''")}`
            : value;

        replacedQuery = replacedQuery.replace(paramPattern, safeValue);
    }

    return replacedQuery;
};

/**
 * Execute a query on the database
 * @param {Object} db - Database connection
 * @param {String} query - Prepared query with replaced parameters
 * @returns {Promise} Query result
 */
const executeQuery = (db, query) => {
    return new Promise((resolve, reject) => {
        db.all(query, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

module.exports = {
    getQuery,
    replaceQueryParams,
    executeQuery
};
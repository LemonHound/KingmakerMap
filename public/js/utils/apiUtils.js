/**
 * Utility functions for making API calls
 */
let apiUtils = {
    /**
     * Base URL for API endpoints
     * Change this if your API is hosted elsewhere
     */
    baseUrl: 'http://localhost:3000',

    /**
     * Make a request to the API
     * @param {string} endpoint - The API endpoint
     * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
     * @param {object} data - Data to send in the request body
     * @returns {Promise} - Promise resolving to the API response
     */
    async request(endpoint = "", method = 'POST', data = null) {
        console.log("request initiated");
        const url = this.baseUrl + endpoint;
        console.log("request URL: ", url);

        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            console.log('response awaiting: ', url, options);
            const response = await fetch(url, options);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Request failed with status ${response.status}`);
            }

            return response.json();
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    },

    /**
     * Map-related API calls
     */
    maps: {
        /**
         * Create a new map
         * @param {object} data - Data needed to create map
         * @returns {Promise} - Promise resolving to the created map
         */
        async create(data) {
            return apiUtils.request('/api/map/create_map', 'POST', data);
        },

        /**
         * Update an existing map
         * @param {object} mapData - Map data to update
         * @returns {Promise} - Promise resolving to the updated map
         */
        async update(mapData) {
            return apiUtils.request('/api/map/update_map', 'POST', mapData);
        },

        /**
         * Get map data
         * @param {{id: string}} id - Map ID (optional)
         * @returns {Promise} - Promise resolving to the map data
         */
        async getMap(id) {
            return apiUtils.request('/api/map/get_map', 'POST', id);
        }
    },

    hexes: {
        /**
         * Get all hexes for the given mapID
         * @param mapID
         * @return {Promise<*>}
         */
        async getHexesByMapID(mapID){
            return apiUtils.request('/api/hexes/get_hexes_by_map_id', 'POST', mapID);
        },

        async updateHex(data) {
            return apiUtils.request('/api/hexes/update_hex', 'POST', data);
        },

        async createHex(data){
            return apiUtils.request('/api/hexes/create_hex', 'POST', data);
        }
    }
};

// Make available in global scope for browser
if (typeof window !== 'undefined') {
    window.apiUtils = apiUtils;
}

// Make available for server-side
if (typeof module !== 'undefined' && module.exports) {
    module.exports = apiUtils;
}
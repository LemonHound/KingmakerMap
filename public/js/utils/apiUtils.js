/**
 * Utility functions for making API calls
 */
let apiUtils = {
    /**
     * Base URL for API endpoints
     */
    get baseUrl() {
        // Check if we're running on localhost
        if (window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname === '') {
            return 'http://localhost:3000';
        }
        // Production URL
        return 'https://inisgorm.xyz';
    },

    /**
     * Make a request to the API
     * @param {string} endpoint - The API endpoint
     * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
     * @param {object} data - Data to send in the request body
     * @returns {Promise} - Promise resolving to the API response
     */
    async request(endpoint = "", method = 'POST', data = null) {
        const url = this.baseUrl + endpoint;

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
        },

        async getMapLink(data){
            return apiUtils.request('/api/map/get_map_link', 'POST', data);
        },

        async createMapLink(data){
            return apiUtils.request('/api/map/create_map_link', 'POST', data);
        }

    },

    hexes: {

        async getHexesByMapID(mapID){
            return apiUtils.request('/api/hexes/get_hexes_by_map_id', 'POST', mapID);
        },

        async updateHex(data) {
            return apiUtils.request('/api/hexes/update_hex', 'POST', data);
        },

        async createHex(data){
            return apiUtils.request('/api/hexes/create_hex', 'POST', data);
        },

        async getHexNotes(data){
            return apiUtils.request('/api/hexes/get_hex_notes', 'POST', data);
        },

        async getHexDetails(data) {
            return apiUtils.request('/api/hexes/get_hex_details', 'POST', data);
        },

        async addNoteToHex(data){
            return apiUtils.request('/api/hexes/add_note_to_hex', 'POST', data);
        },

        async updateHexName(data){
            return apiUtils.request('/api/hexes/update_hex_name', 'POST', data);
        },

        async updateHexVisibility(data){
            return apiUtils.request('/api/hexes/update_hex_visibility', 'POST', data);
        },

        async updateHexExplored(data){
            return apiUtils.request('/api/hexes/update_hex_explored', 'POST', data);
        },

        async updateHexControlled(data){
            return apiUtils.request('/api/hexes/update_hex_controlled', 'POST', data);
        }
    },

    person : {

        async getPersonFromID(data){
            return apiUtils.request('/api/person/get_person_from_id', 'POST', data);
        },

        async getPerson(data){
            return apiUtils.request('/api/person/get_person_details', 'POST', data);
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
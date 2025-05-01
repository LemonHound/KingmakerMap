// public/js/utils/apiUtils.js
// Full file contents

/**
 * Utility functions for making API calls
 */
const apiUtils = {
    /**
     * Base URL for API endpoints
     * Change this if your API is hosted elsewhere
     */
    baseUrl: '',

    /**
     * Make a request to the API
     * @param {string} endpoint - The API endpoint
     * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
     * @param {object} data - Data to send in the request body
     * @returns {Promise} - Promise resolving to the API response
     */
    async request(endpoint, method = 'GET', data = null) {
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
         * @param {object} mapData - Map data to create
         * @returns {Promise} - Promise resolving to the created map
         */
        create(mapData) {
            return apiUtils.request('/map/create', 'POST', mapData);
        },

        /**
         * Update an existing map
         * @param {object} mapData - Map data to update
         * @returns {Promise} - Promise resolving to the updated map
         */
        update(mapData) {
            return apiUtils.request('/map/update', 'POST', mapData);
        },

        /**
         * Get map data
         * @param {string|number} id - Map ID (optional)
         * @returns {Promise} - Promise resolving to the map data
         */
        getMap(id = null) {
            const endpoint = id ? `/map/get_map?id=${id}` : '/map/get_map';
            return apiUtils.request(endpoint, 'GET');
        }
    },

    /**
     * Test-related API calls
     */
    test: {
        /**
         * Test parameter replacement
         * @param {string} testInput - Test input for parameter replacement
         * @returns {Promise} - Promise resolving to the test result
         */
        test(testInput) {
            return apiUtils.request('/api/map/test', 'POST', { TestInput: testInput });
        }
    }
};

// Export the utility for use in other files
export default apiUtils;
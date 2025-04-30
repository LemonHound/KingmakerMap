// Main application entry point
document.addEventListener('DOMContentLoaded', () => {
    console.log('Pathfinder Kingmaker Campaign app initialized');

    // Check if user is already logged in (via stored token)
    const token = localStorage.getItem('authToken');
    if (token) {
        // If token exists, validate it and show the map
        validateToken(token)
            .then(valid => {
                if (valid) {
                    showMap();
                } else {
                    // If token is invalid, show login form
                    showLoginForm();
                }
            })
            .catch(error => {
                console.error('Error validating token:', error);
                showLoginForm();
            });
    } else {
        // No token, show login form
        showLoginForm();
    }
});

// Add user info and logout button to interface
function updateUserInterface() {
    const username = localStorage.getItem('username');
    const isDM = localStorage.getItem('isDM') === 'true';

    // Create header user info if it doesn't exist
    if (!document.getElementById('user-info')) {
        const header = document.querySelector('header');

        const userInfo = document.createElement('div');
        userInfo.id = 'user-info';
        userInfo.style.marginTop = '15px';
        userInfo.style.display = 'flex';
        userInfo.style.justifyContent = 'space-between';
        userInfo.style.alignItems = 'center';

        userInfo.innerHTML = `
            <div>
                Logged in as: <strong>${username}</strong> ${isDM ? '(DM)' : '(Player)'}
            </div>
            <button id="logout-btn">Logout</button>
        `;

        header.appendChild(userInfo);

        // Add logout handler
        document.getElementById('logout-btn').addEventListener('click', logout);
    }
}

// Helper function to show the map interface
function showMap() {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('map-container').classList.remove('hidden');

    // Update the user interface with user info
    updateUserInterface();

    // Check if user is DM and show DM controls if needed
    const isDM = localStorage.getItem('isDM') === 'true';
    if (isDM) {
        enableDMFeatures();
    }

    // Initialize the map
    initializeMap();
}

// Enable DM-specific features
function enableDMFeatures() {
    console.log('Enabling DM features');

    // Create DM controls if they don't exist
    if (!document.getElementById('dm-controls')) {
        const mapContainer = document.getElementById('map-container');

        const dmControls = document.createElement('div');
        dmControls.id = 'dm-controls';
        dmControls.className = 'dm-panel';
        dmControls.innerHTML = `
            <h3>DM Controls</h3>
            <div class="dm-actions">
                <button id="edit-terrain">Edit Terrain</button>
                <button id="add-resource">Add Resource</button>
                <button id="reset-hex">Reset Hex</button>
            </div>
        `;

        // Insert after map controls
        const mapControls = document.getElementById('map-controls');
        mapControls.parentNode.insertBefore(dmControls, mapControls.nextSibling);

        // Add event listeners (to be implemented in map.js)
        document.getElementById('edit-terrain').addEventListener('click', () => {
            if (typeof editSelectedHexTerrain === 'function') {
                editSelectedHexTerrain();
            }
        });

        document.getElementById('add-resource').addEventListener('click', () => {
            if (typeof addResourceToSelectedHex === 'function') {
                addResourceToSelectedHex();
            }
        });

        document.getElementById('reset-hex').addEventListener('click', () => {
            if (typeof resetSelectedHex === 'function') {
                resetSelectedHex();
            }
        });
    }
}

// Helper function to show login form
function showLoginForm() {
    document.getElementById('auth-section').classList.remove('hidden');
    document.getElementById('map-container').classList.add('hidden');
}
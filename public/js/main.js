

// Main application entry point
document.addEventListener('DOMContentLoaded', () => {
    console.log('Pathfinder Kingmaker Campaign app initialized');
    // Set up event listeners
    document.getElementById('logout-btn').addEventListener('click', logout);
    document.getElementById('map-save').addEventListener('click', saveMap);

    // Check if user is already logged in (via stored token)
    const token = localStorage.getItem('authToken');
    if (token) {
        // If token exists, validate it and show the map
        validateToken(token)
            .then(async valid => {
                console.log('token is valid, showing map...');
                if (valid) {
                    await showMap();
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

// Helper function to show the map interface
async function showMap() {
    console.log('Showing map interface');

    // Hide auth section, show map container
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('map-container').classList.remove('hidden');

    // Update the user interface with user info
    updateUserInterface();

/*    try{
        if(typeof initializeMap === 'function'){
            await initializeMap();
        } else {
            console.error('initializeMap function not yet available')
        }
    } catch (e){
        console.error('Error initializing map: ', e);
    }*/
}

// Update user interface based on logged in status
function updateUserInterface() {
    const username = localStorage.getItem('username');
    const isDM = localStorage.getItem('isDM') === 'true';

    // Update username display
    const usernameDisplay = document.getElementById('username-display');
    if (usernameDisplay) {
        usernameDisplay.textContent = `Logged in as: ${username} ${isDM ? '(Admin)' : '(Player)'}`;

        // Show user info section
        document.getElementById('user-info').classList.remove('hidden');
    } else {
        console.error('Username display element not found');
    }
}


// Helper function to show login form
function showLoginForm() {
    document.getElementById('auth-section').classList.remove('hidden');
    document.getElementById('map-container').classList.add('hidden');
    document.getElementById('user-info').classList.add('hidden');
    document.getElementById('map-controls').classList.add('hidden');
    document.getElementById('hex-details').classList.add('hidden');
}
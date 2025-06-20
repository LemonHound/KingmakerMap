
// Main application entry point
document.addEventListener('DOMContentLoaded', () => {
    console.log('Pathfinder Kingmaker Campaign app initialized');
    // Set up event listeners
    document.getElementById('logout-btn').addEventListener('click', logout);
    document.getElementById('map-save').addEventListener('click', saveMap);
    document.getElementById('show-map-link').addEventListener('click', showMapLink);
    document.getElementById('map-link-copy').addEventListener('click', copyMapLink);
    document.getElementById('map-link-overlay-exit').addEventListener('click', closeMapLinkOverlay);
    document.getElementById('players-list-button').addEventListener('click', togglePlayersPanel);
    document.getElementById('close-players-panel')?.addEventListener('click', () => {
        document.getElementById('players-panel').classList.add('hidden');
    });

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

async function showMapLink() {
    const mapID = localStorage.getItem('mapID');
    if(mapID){
        // mapID exists, therefore there should be a map link to display
        let mapLink = await apiUtils.maps.getMapLink({mapID: mapID});
        const mapLinkOverlayText = document.getElementById('mapLinkText');
        const mapLinkOverlay = document.getElementById('mapLinkOverlay');
        if(!mapLink || mapLink.data.rows.length < 1){
            mapLink = await apiUtils.maps.createMapLink({mapID: mapID});
        }
        console.log('maplink:', mapLink);
        mapLinkOverlayText.textContent = mapLink.data.rows[0].map_link_code;

        // set the "Copy Map Link" text to default
        const copyButton = document.getElementById('map-link-copy');
        copyButton.textContent = 'Copy Map Link';
        copyButton.classList.remove('copied');
        mapLinkOverlay.classList.add('show');
    } else {
        alert('please save your map before generating a code!');
    }
}

async function copyMapLink() {
    const mapID = localStorage.getItem('mapID');
    if(mapID){
        const mapLink = await apiUtils.maps.getMapLink({mapID: mapID});
        await navigator.clipboard.writeText(mapLink.data.rows[0].map_link_code);
        const copyButton = document.getElementById('map-link-copy');
        copyButton.textContent = 'Copied!';
        copyButton.classList.add('copied');
    }
}

async function closeMapLinkOverlay(){
    const mapLinkOverlay = document.getElementById('mapLinkOverlay');
    mapLinkOverlay.classList.remove('show');
}

function togglePlayersPanel() {
    const panel = document.getElementById('players-panel');
    panel.classList.toggle('hidden');
}

function updatePlayersList(players) {
    const playersListElement = document.getElementById('players-list');

    if (!players || players.length === 0) {
        playersListElement.innerHTML = '<p>No other players connected</p>';
        return;
    }

    const playersHTML = players.map(player => `
        <div class="player-item ${player.isOnline ? '' : 'offline'}">
            <div class="player-name">${player.name || 'Unknown Player'}</div>
            <div class="player-status">
                ${player.isOnline ? '🟢 Online' : '🔴 Offline'}
            </div>
        </div>
    `).join('');

    playersListElement.innerHTML = playersHTML;
}

// Helper function to show the map interface
async function showMap() {
    console.log('Showing map interface');

    // Hide auth section, show map container
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('map-container').classList.remove('hidden');

    // Update the user interface with user info
    await updateUserInterface();
}

// Update user interface based on logged in status
async function updateUserInterface() {
    const username = localStorage.getItem('username');
    const isDM = localStorage.getItem('isDM') === 'true';

    const personDetails = apiUtils.person.getPerson({username: username});
    console.log('person details during user interface update: ', personDetails);
    // const mapID =

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
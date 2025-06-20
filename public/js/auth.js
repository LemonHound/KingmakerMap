// Authentication related functions
document.addEventListener('DOMContentLoaded', () => {
    // Get login form
    const loginForm = document.getElementById('login');

    // Add event listener to login form
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Add registration option to the form
    const authSection = document.getElementById('auth-section');
    if (authSection) {
        const registerLink = document.createElement('p');
        registerLink.innerHTML = 'New player? <a href="#" id="show-register">Register here</a>';
        registerLink.style.marginTop = '10px';
        registerLink.style.color = '#ecf0f1';
        registerLink.style.textAlign = 'center';
        authSection.querySelector('#login-form').appendChild(registerLink);

        // Add event listener to show registration form
        document.getElementById('show-register').addEventListener('click', (e) => {
            e.preventDefault();
            showRegistrationForm();
        });
    }
});

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        alert('Username and password are required');
        return;
    }

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }

        // Store authentication data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('username', data.user.username);
        localStorage.setItem('isDM', data.user.isDM);
        localStorage.setItem('personID', data.user.id);
        localStorage.setItem('mapID', data.map.map_id);

        // Redirect to main interface
        window.location.reload(); // This will reload the page and the main.js will handle showing the map
    } catch (error) {
        console.error('Login error:', error);
        alert(error.message || 'Login failed. Please check your credentials.');
    }
}

// Show registration form
function showRegistrationForm() {
    const authSection = document.getElementById('auth-section');
    const loginForm = document.getElementById('login-form');
    const mapControls = document.getElementById('map-controls');

    // Create registration form if it doesn't exist
    if (!document.getElementById('register-form')) {
        const registerForm = document.createElement('div');
        registerForm.id = 'register-form';
        registerForm.innerHTML = `
            <h2>Register</h2>
            <form id="register">
                <div class="form-group">
                    <label for="reg-username">Username:</label>
                    <input type="text" id="reg-username" name="username" required>
                </div>
                <div class="form-group">
                    <label for="reg-password">Password:</label>
                    <input type="password" id="reg-password" name="password" required>
                </div>
                <div class="form-group">
                    <label for="reg-confirm-password">Confirm Password:</label>
                    <input type="password" id="reg-confirm-password" name="confirmPassword" required>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="is-dm" name="isDM"> I am the Dungeon Master
                    </label>
                    <div id="dm-info-bubble" style="display: none; margin-top: 8px; padding: 10px; background-color: #e3f2fd; border: 1px solid #2196f3; border-radius: 4px; font-size: 14px; color: #1976d2;">
                        Registering as a new DM means you will generate a new map.<br/><br/>
                        Your players can link to your map once you save the map and provide them with the generated code.                        
                    </div>
                </div>
                <div class="form-group" id="dm-map-link-group">
                    <label for="dm-map-link">Link to DM's Map:</label>
                    <input type="text" id="dm-map-link" name="dmMapLink" placeholder="Enter the DM's map link">
                </div>
                <button type="submit">Register</button>
            </form>
            <p style="margin-top: 10px; text-align: center;">
                <a href="#" id="show-login">Back to Login</a>
            </p>
        `;

        authSection.appendChild(registerForm);

        // Add event listeners
        document.getElementById('register').addEventListener('submit', handleRegistration);
        document.getElementById('is-dm').addEventListener('change', toggleMapLinkField);
        document.getElementById('show-login').addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.style.display = 'block';
            document.getElementById('register-form').style.display = 'none';
            document.getElementById('map-controls').style.display = 'none';
        });
    }

    // Hide login, show registration
    loginForm.style.display = 'none';
    mapControls.style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
}

async function toggleMapLinkField(){
    const dmMapLinkGroup = document.getElementById('dm-map-link-group');
    const dmInfoBubble = document.getElementById('dm-info-bubble');

    if (this.checked) {
        // Hide the map link field and show the info bubble
        dmMapLinkGroup.style.display = 'none';
        dmInfoBubble.style.display = 'block';
    } else {
        // Show the map link field and hide the info bubble
        dmMapLinkGroup.style.display = 'block';
        dmInfoBubble.style.display = 'none';
    }
}

// Handle registration form submission
async function handleRegistration(event) {
    event.preventDefault();

    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    const isDM = document.getElementById('is-dm').checked;
    const dmMapLink = document.getElementById('dm-map-link').value;

    // Basic validation
    if (!username || !password) {
        alert('Username and password are required');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    if (!dmMapLink && !isDM){
        alert('DM map link is required');
        return;
    }

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password,
                isDM,
                dmMapLink
            })
        });

        const data = await response.json();
        console.log('response: ', data);

        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }

        // Store authentication data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('username', data.user.username);
        localStorage.setItem('isDM', data.user.isDM);
        // localStorage.setItem('mapID', data.)

        alert('Registration successful!');

        // Show the map interface
        await showMap();
    } catch (error) {
        console.error('Registration error:', error);
        alert(error.message || 'Registration failed. Please try again.');
    }
}

// Function to log out
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('isDM');
    localStorage.removeItem('personID');
    localStorage.removeItem('mapID');
    showLoginForm();
}

// Validate token with the server
async function validateToken(token) {
    try {
        const response = await fetch('/api/auth/verify', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        return data.valid === true;
    } catch (error) {
        console.error('Token validation error:', error);
        return false;
    }
}
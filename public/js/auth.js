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

// Handle registration form submission
async function handleRegistration(event) {
    event.preventDefault();

    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    const isDM = document.getElementById('is-dm').checked;

    // Basic validation
    if (!username || !password) {
        alert('Username and password are required');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password, isDM })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }

        // Store authentication data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('username', data.user.username);
        localStorage.setItem('isDM', data.user.isDM);

        alert('Registration successful!');

        // Show the map interface
        showMap();
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
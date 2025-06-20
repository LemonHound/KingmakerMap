const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const mapRoutes = require('./routes/map');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://192.168.1.225:3000',
        'http://172.17.0.1:3000',
        'https://inisgorm.xyz',
        'https://www.inisgorm.xyz'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'Cache-Control',
        'X-Access-Token'
    ],
    credentials: true, // Enable if you're using cookies or authentication
    optionsSuccessStatus: 200 // For legacy browser support
};

// testing
app.use((req, res, next) => {
    console.log('Origin:', req.headers.origin);
    next();
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/hexes', mapRoutes);

// Default route serves index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Initialize database and start server
async function startServer() {
    try {
        // Start the server
        app.listen(PORT, () => {
            console.log(`Server running on  http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
}

startServer();
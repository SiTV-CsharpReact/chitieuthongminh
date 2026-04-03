const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const imageRouter = require('./routes/image');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure upload directories exist
const uploadDir = path.join(__dirname, 'upload', 'image');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Static files (Allow browser to view uploaded images)
app.use('/upload/image', express.static(path.join(__dirname, 'upload', 'image')));

// API Routes
app.use('/api/image', imageRouter);

// Basic health check
app.get('/', (req, res) => {
    res.json({ status: 'Zenith Media Service is running', port: PORT });
});

app.listen(PORT, () => {
    console.log(`🚀 Zenith Media Service listening at http://localhost:${PORT}`);
});

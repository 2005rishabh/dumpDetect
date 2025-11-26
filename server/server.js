const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));

// MongoDB Connection
// Replace with your MongoDB URI if using Atlas, otherwise defaults to local
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/water-pollution-monitor';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Schema
const reportSchema = new mongoose.Schema({
    location: { type: String, required: true },
    coordinates: { type: String },
    description: { type: String, required: true },
    imagePath: { type: String },
    severity: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    status: { type: String, enum: ['Pending', 'Under Review', 'Resolved', 'False Alarm'], default: 'Pending' },
    date: { type: Date, default: Date.now }
});

const Report = mongoose.model('Report', reportSchema);

// Multer Setup for Image Upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Routes

// GET all reports
app.get('/api/reports', async (req, res) => {
    try {
        const reports = await Report.find().sort({ date: -1 });
        res.json(reports);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET single report
app.get('/api/reports/:id', async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) return res.status(404).json({ message: 'Report not found' });
        res.json(report);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST new report
app.post('/api/reports', upload.single('image'), async (req, res) => {
    try {
        const { location, description, coordinates } = req.body;
        const imagePath = req.file ? `http://localhost:${PORT}/uploads/${req.file.filename}` : null;

        const newReport = new Report({
            location,
            description,
            coordinates: coordinates || "Unknown",
            imagePath,
            // Randomly assign severity for demo purposes if not provided
            severity: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)]
        });

        const savedReport = await newReport.save();
        res.status(201).json(savedReport);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PATCH update status
app.patch('/api/reports/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const report = await Report.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!report) return res.status(404).json({ message: 'Report not found' });
        res.json(report);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

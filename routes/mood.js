const express = require('express');
const router = express.Router();
const Mood = require('../models/Mood');
const verifyToken = require('../middleware/authmiddleware');

// Create mood entry
router.post('/api/mood', verifyToken, async (req, res) => {
    try {
        const { emotion, intensity, note, triggers, activities } = req.body;

        if (!emotion || !intensity) {
            return res.status(400).json({ error: 'Emotion and intensity are required' });
        }

        const mood = new Mood({
            userId: req.user.id,
            emotion,
            intensity: Math.min(Math.max(intensity, 1), 10),
            note: note || '',
            triggers: triggers || [],
            activities: activities || []
        });

        await mood.save();
        res.json({ success: true, mood });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get moods for today
router.get('/api/mood/today', verifyToken, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const moods = await Mood.find({
            userId: req.user.id,
            createdAt: { $gte: today, $lt: tomorrow }
        }).sort({ createdAt: -1 });

        res.json(moods);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get mood analytics (weekly/monthly)
router.get('/api/mood/analytics/:period', verifyToken, async (req, res) => {
    try {
        const { period } = req.params;
        const startDate = new Date();

        if (period === 'weekly') {
            startDate.setDate(startDate.getDate() - 7);
        } else if (period === 'monthly') {
            startDate.setMonth(startDate.getMonth() - 1);
        } else {
            return res.status(400).json({ error: 'Period must be weekly or monthly' });
        }

        const moods = await Mood.find({
            userId: req.user.id,
            createdAt: { $gte: startDate }
        }).sort({ createdAt: 1 });

        // Calculate analytics
        const emotionCounts = {};
        const intensityAvg = {};
        let totalIntensity = 0;

        moods.forEach(mood => {
            emotionCounts[mood.emotion] = (emotionCounts[mood.emotion] || 0) + 1;
            totalIntensity += mood.intensity;
        });

        const average = moods.length > 0 ? (totalIntensity / moods.length).toFixed(1) : 0;

        res.json({
            moods,
            analytics: {
                total: moods.length,
                emotionCounts,
                averageIntensity: average,
                period
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all moods with pagination
router.get('/api/mood', verifyToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const moods = await Mood.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Mood.countDocuments({ userId: req.user.id });

        res.json({
            moods,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get mood by ID
router.get('/api/mood/:id', verifyToken, async (req, res) => {
    try {
        const mood = await Mood.findOne({ _id: req.params.id, userId: req.user.id });
        if (!mood) {
            return res.status(404).json({ error: 'Mood not found' });
        }
        res.json(mood);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update mood
router.put('/api/mood/:id', verifyToken, async (req, res) => {
    try {
        const { emotion, intensity, note, triggers, activities } = req.body;
        const mood = await Mood.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { emotion, intensity, note, triggers, activities },
            { new: true }
        );
        if (!mood) {
            return res.status(404).json({ error: 'Mood not found' });
        }
        res.json(mood);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete mood
router.delete('/api/mood/:id', verifyToken, async (req, res) => {
    try {
        const mood = await Mood.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!mood) {
            return res.status(404).json({ error: 'Mood not found' });
        }
        res.json({ success: true, message: 'Mood deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

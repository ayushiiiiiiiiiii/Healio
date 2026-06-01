const express = require('express');
const router = express.Router();
const User = require('../models/user');
const verifyToken = require('../middleware/authmiddleware');

// Get user profile
router.get('/api/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update user profile
router.put('/api/profile', verifyToken, async (req, res) => {
    try {
        const { username, bio, preferences, profilePicture } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                username,
                bio,
                preferences,
                profilePicture
            },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get user statistics
router.get('/api/profile/stats', verifyToken, async (req, res) => {
    try {
        const Mood = require('../models/Mood');
        const Journal = require('../models/Journal');
        const Chat = require('../models/Chat');

        const totalMoods = await Mood.countDocuments({ userId: req.user.id });
        const totalEntries = await Journal.countDocuments({ userId: req.user.id, deletedAt: null });
        const totalChats = await Chat.countDocuments({ userId: req.user.id });

        // Get current streak
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayMood = await Mood.findOne({
            userId: req.user.id,
            createdAt: { $gte: today }
        });

        res.json({
            totalMoods,
            totalEntries,
            totalChats,
            streakToday: todayMood ? true : false
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

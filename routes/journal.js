const express = require('express');
const router = express.Router();
const Journal = require('../models/Journal');
const verifyToken = require('../middleware/authmiddleware');

// Create journal entry
router.post('/api/journal', verifyToken, async (req, res) => {
    try {
        const { title, content, emotion, tags, isPinned } = req.body;

        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }

        const journal = new Journal({
            userId: req.user.id,
            title,
            content,
            emotion: emotion || null,
            tags: tags || [],
            isPinned: isPinned || false
        });

        await journal.save();
        res.json({ success: true, journal });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all journal entries with filtering
router.get('/api/journal', verifyToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const { tag, emotion, search } = req.query;

        let query = { userId: req.user.id, deletedAt: null };

        if (tag) {
            query.tags = { $in: [tag] };
        }
        if (emotion) {
            query.emotion = emotion;
        }
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }

        const entries = await Journal.find(query)
            .sort({ isPinned: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Journal.countDocuments(query);

        res.json({
            entries,
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

// Get journal entry by ID
router.get('/api/journal/:id', verifyToken, async (req, res) => {
    try {
        const entry = await Journal.findOne({
            _id: req.params.id,
            userId: req.user.id,
            deletedAt: null
        });
        if (!entry) {
            return res.status(404).json({ error: 'Journal entry not found' });
        }
        res.json(entry);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update journal entry
router.put('/api/journal/:id', verifyToken, async (req, res) => {
    try {
        const { title, content, emotion, tags, isPinned } = req.body;
        const entry = await Journal.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id, deletedAt: null },
            { title, content, emotion, tags, isPinned, updatedAt: new Date() },
            { new: true }
        );
        if (!entry) {
            return res.status(404).json({ error: 'Journal entry not found' });
        }
        res.json(entry);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Soft delete journal entry
router.delete('/api/journal/:id', verifyToken, async (req, res) => {
    try {
        const entry = await Journal.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { deletedAt: new Date() },
            { new: true }
        );
        if (!entry) {
            return res.status(404).json({ error: 'Journal entry not found' });
        }
        res.json({ success: true, message: 'Journal entry deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all tags for user
router.get('/api/journal/tags/list', verifyToken, async (req, res) => {
    try {
        const tags = await Journal.distinct('tags', {
            userId: req.user.id,
            deletedAt: null
        });
        res.json({ tags });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

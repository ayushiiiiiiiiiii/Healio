const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    emotion: { type: String, required: true, enum: ['happy', 'sad', 'anxious', 'calm', 'angry', 'hopeful', 'overwhelmed', 'grateful'] },
    intensity: { type: Number, min: 1, max: 10, required: true },
    note: { type: String, default: '' },
    triggers: [String],
    activities: [String],
    timestamp: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Mood', moodSchema);

const mongoose = require('mongoose');

const affirmationSchema = new mongoose.Schema({
    text: { type: String, required: true },
    category: { type: String, enum: ['daily', 'mental-health', 'strength', 'self-love', 'anxiety', 'depression', 'motivation'], required: true },
    targetEmotions: [String],
    author: { type: String, default: 'Anonymous' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Affirmation', affirmationSchema);

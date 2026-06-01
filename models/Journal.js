const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    emotion: { type: String, default: null },
    tags: [{ type: String, lowercase: true }],
    isPinned: { type: Boolean, default: false },
    isPrivate: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null }
});

journalSchema.index({ userId: 1, createdAt: -1 });
journalSchema.index({ userId: 1, tags: 1 });

module.exports = mongoose.model('Journal', journalSchema);

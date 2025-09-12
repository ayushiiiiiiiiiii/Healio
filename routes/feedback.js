const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback'); // MongoDB model

router.post('/feedback', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).send("All fields are required.");
    }

    const feedback = new Feedback({ name, email, message });
    await feedback.save();
    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error.");
  }
});

module.exports = router;

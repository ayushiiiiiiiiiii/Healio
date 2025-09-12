const express = require("express");


const router = express.Router();

router.post("/api/chat/chatbot", async (req, res) => {

    try {
       
        if (!req.body.contents) {
            return res.status(400).json({ error: "contents missing in request body" });
        }
        const inputForAPI = {
            contents: req.body.contents
          };
      
        const response = await fetch(

            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(inputForAPI) }
        );

        const data = await response.json();
        // console.log("Gemini API response:", data);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/chat', (req, res) => res.render('chat'));



module.exports = router;

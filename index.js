require('dotenv').config();
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser')
const authRoutes = require('./routes/auth');
const mongoose = require('mongoose');
const verifyToken = require('./middleware/authmiddleware');
const chatRoutes = require('./routes/chat');
const moodRoutes = require('./routes/mood');
const journalRoutes = require('./routes/journal');
const wellnessRoutes = require('./routes/wellness');
const profileRoutes = require('./routes/profile');
const feedbackRoutes = require('./routes/feedback');

app.set("view engine", "ejs");
app.use(express.json());

//Static files from 'public' directory
app.use(express.static('public'));
// Body parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/', authRoutes);
app.use('/', chatRoutes);
app.use('/', moodRoutes);
app.use('/', journalRoutes);
app.use('/', wellnessRoutes);
app.use('/', profileRoutes);
app.use('/', feedbackRoutes);

// Page Routes
app.get('/', (req, res) => {
    res.render("login_signup")
})

app.get('/landing', (req, res) => {
    res.render("landing")
})

app.get('/home', verifyToken, (req, res) => {
    res.render("home", { feedbackSuccess: false })
})

app.get('/dashboard', verifyToken, (req, res) => {
    res.render("dashboard")
})

app.get('/mood-tracker', verifyToken, (req, res) => {
    res.render("mood-tracker")
})

app.get('/journal', verifyToken, (req, res) => {
    res.render("journal")
})

app.get('/wellness', verifyToken, (req, res) => {
    res.render("wellness")
})

app.get('/profile', verifyToken, (req, res) => {
    res.render("profile")
})

app.get('/chat', verifyToken, (req, res) => {
    res.render("chat");
});

app.post("/chat", verifyToken, (req, res) => {
    res.render("chat");
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('login_signup', { message: 'Page not found', type: 'error' });
});

app.listen(3000, () => console.log("Server running on port 3000"));

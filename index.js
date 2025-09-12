require('dotenv').config();
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser')
const authRoutes = require('./routes/auth');
const mongoose = require('mongoose');
const verifyToken = require('./middleware/authmiddleware');
const chatRoutes = require('./routes/chat');
const feedbackRoutes = require('./routes/feedback');
app.set("view engine", "ejs");
app.use(express.json());

//Static files from 'public' directory
app.use(express.static('public'));
// Body parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/', authRoutes);
app.use('/', chatRoutes);
app.use('/', feedbackRoutes);


app.get('/', (req, res) => {
    res.render("login_signup")
})


app.get('/home', verifyToken, (req, res) => {
    res.render("home", { feedbackSuccess: false })
})

app.post("/chat", (req, res) => {
    res.render("chat");
});

app.listen(3000)

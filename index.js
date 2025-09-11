require('dotenv').config();
const express=require('express');
// console.log("JWT_SECRET:", process.env.JWT_SECRET);
const app=express();
const cookieParser=require('cookie-parser')
const authRoutes = require('./routes/auth');
const mongoose = require('mongoose');
const verifyToken = require('./middleware/authmiddleware');
app.set("view engine", "ejs");
app.use(express.json());
// Serve static files from the 'public' directory
app.use(express.static('public'));
// Body parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/', authRoutes);

app.get('/',(req,res)=>{
    res.render("login_signup")
})
// app.post('/signup', (req, res) => {
//     console.log(req.body);
//     res.send("Signup route works!");
//   });
  
app.get('/home',verifyToken,(req,res)=>{
    res.render("home")
})


app.listen(3000)

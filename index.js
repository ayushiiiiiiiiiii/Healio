const express=require('express');
const app=express();
const cookieParser=require('cookie-parser')

app.set("view engine", "ejs");
app.use(express.json());
// Serve static files from the 'public' directory
app.use(express.static('public'));
// Body parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// app.get('/',(req,res)=>{
//     res.render("login_signup")
// })
app.get('/',(req,res)=>{
    res.render("home")
})


app.listen(3000)
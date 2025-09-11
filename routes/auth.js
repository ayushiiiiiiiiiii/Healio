const express=require('express');
const router=express.Router();
const User=require('../models/user');
const bcrypt=require('bcrypt');
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
router.post('/signup',async(req,res)=>{
    try{
    const {username,email,password}=req.body;
    const user = await User.findOne({email});
    if(user){
        // return res.send("User already exists");
        return res.render('login_signup',{message:'User already exists',type:'error'});
    }

    const salt=10;
    const hashedPassword=await bcrypt.hash(password,salt);

    await User.create({username,email,password:hashedPassword});
    // return res.send(`<script>alert('Your account has been created'); window.location.href='/';</script>`);
    return res.render('login_signup', { message: 'Your account has been created', type: 'success' });
}catch(err){
    // return res.send(`<script>alert('Error: ${err.message}'); window.location.href='/';</script>`);
    return res.render('login_signup', { message: 'Error: ' + err.message, type: 'error' });
}
})

router.post('/signin',async(req,res)=>{
    // console.log("JWT_SECRET:", process.env.JWT_SECRET);
    let {username,password}=req.body;
    try{
        let user =await User.findOne({username});
        if(!user){
            return res.render("login_signup", { 
                message: "User not found!", 
                type: "error" 
              });
        }
        let isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.render("login_signup", { 
                message: "Invalid password!", 
                type: "error" 
              });
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            JWT_SECRET,
            { expiresIn: "7d" }
        );
        

        res.cookie("token", token)
        return res.redirect("/home");
    }catch (err) {
        return res.render("login_signup", { 
          message: `Error: ${err.message}`, 
          type: "error" 
        });}

})

router.post('/logout',(req,res)=>{
    res.clearCookie("token");
    return res.redirect('/');
})

module.exports=router;




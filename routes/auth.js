const express=require('express');
const router=express.Router();
const User=require('../models/user');
const bcrypt=require('bcrypt');

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

module.exports=router;




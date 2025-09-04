const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/healio');

const userSchema = new mongoose.Schema({
    // name:String,
    // email:String,
    // password:String
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true }
})

module.exports=mongoose.model('User',userSchema);
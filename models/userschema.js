const mongoose =require('mongoose');
const user_schema= new mongoose.Schema({
    user_id:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    admin:{
        type:String,
        default:false
    },
},{
    timestamps:true
});

const users = mongoose.model('users',user_schema);
module.exports=users;
const mongoose =require('mongoose');
const employee_schema= new mongoose.Schema({
    employee_id:{
        type:String,
        required:true,
        unique:true
    },
    emp_name:{
        type:String,
        required:true
    },
    gender:{
        type:String,
        required:true
    },
    employee_file:{
        type:String,
        required:true
    }
},{
    timestamps:true
});

const employee = mongoose.model('employees',employee_schema);
module.exports=employee;
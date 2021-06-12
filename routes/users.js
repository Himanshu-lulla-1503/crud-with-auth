const express = require('express');
const Router = express.Router();
const bcrypt= require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticate = require('../authentication/authenticate');
const authenticateadmin = require('../authentication/authenticateadmin');
const user = require('../models/userschema');
const employee = require('../models/Employee');
Router.use(express.json());
Router.use(express.urlencoded({extended:false}));

//multer package for uploading files
const multer=require('multer');
const storage= multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'./files');
    },
    filename:(req,file,cb)=>{
        cb(null, new Date().toISOString().replace(/[-T:\.Z]/g, "") + file.originalname);
    }
});

const upload=multer({storage:storage});






Router.route('/')
.get((req,res,next)=>{
    res.render('login');
})
.post(async (req,res,next)=>{
    user.findOne({user_id:req.body.username}).then((result)=>{
        if(!result){
            res.statusCode=401;
            res.json({"status":"No such user exists"});
        }
        else{
            bcrypt.compare(req.body.password,result.password,(err,flag)=>{
                if(flag){
                    const token=jwt.sign({user_id:result.user_id,admin:result.admin},process.env.mysecret,{expiresIn:"1h"});
                    res.cookie('authcookie',token, {signed:true});
                    res.redirect('/homepage');
                }
                else{
                    res.statusCode=401;
                    res.json({"Error":"Invalid credentials"});
                }

            });
           
        }
        }).catch((err)=>{
            console.log(err);
            next(err);
        })


})



Router.route('/signup')
.get((req,res,next)=>{
    res.render('signup');
})
.post(async(req,res,next)=>{
    let {username,password,role} = req.body;
    const hashedpassword=await bcrypt.hash(password,10)
    try{
    await user.create({
        user_id:username,
        password:hashedpassword,
        admin:role
       });
    res.redirect('/');
    }
    catch(err){
        console.log(err);
        next(err);
    }


})


Router.route('/logout')
.get(authenticate,(req,res,next)=>{
    res.clearCookie('authcookie');
    res.redirect('/');
})


Router.route('/homepage')
.get(authenticate,async(req,res,next)=>{
    const data = await employee.find({});
   res.render('homepage',{data});
})





//CRUD on Employees 
Router.route('/employee')
.get(authenticate,async(req,res,next)=>{
    const data = await employee.find({});
    if(!data){
        res.statusCode=200;
        res.send([]);
    }
    else{
        res.statusCode=200;
        res.send(data);
    }

})
.post(authenticateadmin,upload.single('empFile'),(req,res,next)=>{
    const fname = req.file.originalname.split('.').slice(0, -1).join('.');
    if(fname===req.body.empid){
        employee.create({
        employee_id:req.body.empid,
        emp_name: req.body.name,
        gender:req.body.gender,
        employee_file:req.file.path
    }).then((result)=>{
        res.redirect('/homepage');
    }).catch((err)=>{
        console.log(err);
        next(err);
    });
    }
    else{
        res.statusCode=400;
        res.json({"error":"filename must be same as the employee-id"});
    }
})
.put((req,res,next)=>{
    res.statusCode=403;
    res.json({"Error":"Put Operation not supported on entire employees try selecting employee by id to update"});

})
.delete((req,res,next)=>{
    res.statusCode=403;
    res.json({"Error":"Delete Operation not supported on entire employees try selecting employee by id to delete"});
})








//get and delete employee by id 
Router.route('/employee/:employeeid')
//get for getting info for particular emp_id
.get(async(req,res,next)=>{
    try{
    const data = await employee.findOne({employee_id:req.params.employeeid})
    if(!data){
        res.statusCode=200;
        res.send([]);
    }
    else{
        res.statusCode=200;
        res.send(data);
    }
    }
    catch(err){
        console.log(err);
        next(err);
    }
    

})
.delete(authenticateadmin,(req,res,next)=>{
    employee.findOneAndDelete({employee_id:req.params.employeeid}).then((result)=>{
        res.send(true);
    }).catch((err)=>{
        console.log(err);
        next(err);
    })

    
})


//route to update userinfo

Router.route('/updateemployee')
.post(authenticateadmin,upload.single('empFile2'),(req,res,next)=>{
    const fname = req.file.originalname.split('.').slice(0, -1).join('.');
    if(fname===req.body.empid2){
    employee.findOneAndUpdate({employee_id:req.body.empid2},{$set:{emp_name:`${req.body.name2}`,gender:`${req.body.gender2}`,employee_file:`${req.file.path}`}},{new:true}).then((result)=>{
        if(!result){
            res.statusCode=200;
            res.json({"error":"some error occured"});
        }
        else{
           res.redirect('/homepage');
        }
        
    }).catch((err)=>{
        console.log(err);
        next(err);
    })
}
else{
    res.statusCode=400;
    res.json({"error":"filename must be same as the employee-id"});
}
})

module.exports=Router;
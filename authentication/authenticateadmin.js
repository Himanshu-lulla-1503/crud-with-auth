const jwt = require('jsonwebtoken');
const user = require('../models/userschema');
module.exports= (req,res,next)=>{
    if(!req.signedCookies.authcookie){
        res.statusCode=401;
        res.redirect('/');
    }
    else{
        jwt.verify(req.signedCookies.authcookie,process.env.mysecret,async(err,decoded)=>{
            if (err){
                next(err);
            }
            const data = await user.findOne({user_id:decoded.user_id});
            if(!data){
                res.redirect('/');
            }
            else{
                if(decoded.admin==="false"){
                    res.statusCode=403;
                    res.json({"error":"You are not admin you cannot add employees"});
                }
                else{
                    next();
                }
            }

        })
    }

}
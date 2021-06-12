const mongoose = require('mongoose');
mongoose.connect(process.env.MYDB,{useNewUrlParser: true,useUnifiedTopology: true,useFindAndModify:false,useCreateIndex:true}).then(()=>{
    console.log("connection successful");
}).catch((err)=>{
    console.log(err);
    next(err);
})
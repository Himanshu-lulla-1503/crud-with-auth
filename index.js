const express = require('express');
const app = express();
const port=process.env.PORT||7000;
const path = require('path');
const publicdir= path.resolve('./public');
const cookieParser= require('cookie-parser');
require('dotenv').config();
require('./models/conn');
const userRouter=require('./routes/users');
app.use(cookieParser(process.env.mysecret));
app.set('view engine','hbs');
app.use(express.static(publicdir));
app.use('/',userRouter);
app.use('/files',express.static('files'));


//Overall Error handler

app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).json({"error":err.message});
});


app.listen(port,()=>{
    console.log(`server running at port ${port}`);
});
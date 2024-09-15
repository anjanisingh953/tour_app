//Everything related to server

const dotenv = require('dotenv');
dotenv.config({path: './config.env'});
const app = require('./app');
const mongoose = require('mongoose');
const DB = process.env.DATABASE;

mongoose.connect(DB).then(con=>{
    console.log('database connected')
});



const PORT = process.env.PORT || 8000;

app.listen(PORT,(req,res)=>{
    console.log(`Your app is listening at port ${PORT}`);
});
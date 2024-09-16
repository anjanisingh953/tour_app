//Everything related to server

const dotenv = require('dotenv');

process.on('uncaughtException', err =>{
    console.log(err.name, err.message);
    console.log('Uncaught Exception! Shutting down');
        process.exit(0)        
})


dotenv.config({path: './config.env'});
const app = require('./app');
const mongoose = require('mongoose');
const DB = process.env.DATABASE;

mongoose.connect(DB).then(con=>{
    console.log('database connected')
});



const PORT = process.env.PORT || 8000;

const server = app.listen(PORT,(req,res)=>{
    console.log(`Your app is listening at port ${PORT}`);
});

process.on('unhandledRejection', err =>{
    console.log(err.name, err.message);
    console.log('Unhandled Rejection! Shutting down');
    
    server.close(()=>{
        process.exit(0)        
    })

});



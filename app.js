//Here everything is related to express
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const app = express();


//1. Global middleware
  
//Set security HTTP Headers
app.use(helmet());


//Developemnt logging
if(process.env.NODE_ENV == 'development'){
    app.use(morgan('dev'));
}

//Limit request from same IP
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,  //1hour
    message: 'Too many request from this IP, please try again in an hour'
});
app.use('/api', limiter);

//To parse the body data into req.body   
app.use(express.json({ limit: '30kb' })); // used to check data size (limit) the passed data in request body

//Data Sanitization against NoSQL Query injection
app.use(mongoSanitize());

//Data Sanitization against XSS
app.use(xss()); //this middlware will clean any user input malicious HTML code
 
//To prevent parameter pollution or avoid the repetition of query fields in a url(endpoint)
app.use(hpp({

    whitelist:[
                'duration',
                'ratingQuantity',
                'ratingAverage',
                'maxGroupSize',
                'difficulty',
                'price'
                
              ]
}));


//Serving static files
app.use(express.static(`${__dirname}/public`));

//Test middleware
app.use((req, res, next)=>{
    req.requestTime = new Date().toISOString();
    // console.log(req.headers)
    next();
})

//Routes
app.use('/api/v1/tours',tourRouter);
app.use('/api/v1/users',userRouter);


//Middleware to handle undefined Routes
app.all('*',(req, res, next)=>{


    // const err = new Error(`Can't find ${req.originalUrl} on this server`);
    // err.status = 'fail';
    // err.statusCode = 404;

    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
})

app.use(globalErrorHandler);



module.exports = app;
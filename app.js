//Here everything is related to express
const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const app = express();

app.use(morgan('dev'));
app.use(express.json()); // To read the incoming body data


//Routes
app.use('/api/v1/tours',tourRouter);
app.use('/api/v1/tours',userRouter);

app.all('*',(req, res, next)=>{


    // const err = new Error(`Can't find ${req.originalUrl} on this server`);
    // err.status = 'fail';
    // err.statusCode = 404;

    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
})

app.use(globalErrorHandler);



module.exports = app;
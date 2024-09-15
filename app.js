//Here everything is related to express
const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const app = express();

app.use(morgan('dev'));
app.use(express.json()); // To read the incoming body data


//Routes
app.use('/api/v1/tours',tourRouter);
app.use('/api/v1/tours',userRouter);


module.exports = app;
const AppError = require('../utils/appError')

const handleCastErrorDB = err =>{
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400); 
}

const handleDuplicateFieldsErrorDB = err =>{
    const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
    const message = `Duplicate field value : ${value} . Please use another value`;
    return new AppError(message, 400);
}

const handleValidationErroDB =  err =>{
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data: ${errors.join('. ')}`;
    return new AppError(message, 400);
}

const sendErrorDev = (err, res)=>{

    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    })
};

const sendErrorProd =  (err, res)=>{

    if(err.isOperational){
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }else{
        console.error('ERROR >>>>',err);
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong'
        });

    }

};



globalErrorHandler = (err, req, res, next)=>{

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV === 'development'){
        sendErrorDev(err, res);
    }else if(process.env.NODE_ENV === 'production'){
        let error = { ...err };

        // console.log(err.name)
        if(err.name === 'CastError') error = handleCastErrorDB(err);
        if(err.code === 11000 ) error = handleDuplicateFieldsErrorDB(err);
        if(err.name === 'ValidationError') error = handleValidationErroDB(err)
        sendErrorProd(error, res);
    }

    
};

module.exports = globalErrorHandler;            
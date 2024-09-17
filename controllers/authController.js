const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


const signToken = (id) =>{
    // console.log('id  <><><>',id)
    return jwt.sign( {id} , process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}


exports.signup = catchAsync(async(req, res, next)=>{
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        role: req.body.role
    });
    
    const token = signToken(newUser._id);

    res.status(200).json({
        status: 'success',
        token, 
        data: {
            user: newUser
        }
    })
});



exports.login = catchAsync(async(req, res, next)=>{

    const { email, password } = req.body;

    if(!email || !password){
      return next(new AppError('Please provide email and passwrod!', 400));
    }

    const user = await User.findOne({email}).select('+password');
    console.log(user)
    const correct = user.correctPassword(password, user.password); 

    if(!user && !correct){
        return next(new AppError('Email or password is invalid!', 401));
    }


    const token = signToken(user._id);

    res.status(200).json({ 

        status: 'success',
        token
    
    });



});


exports.protect = catchAsync(async (req, res, next)=>{
    // console.log('prorotectd',req.headers);
    
    //Step 1: Check authorization header is passed or not while requesting
    console.log('req.headers.authorization ',req.headers.authorization)

    if(!req.headers.authorization){
        return res.status(400).json({
            status: 'failed',
            message: 'Please provide authorization headers'
        });
    }

    let token;
    //Step 2: Getting token from headers
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
      token = req.headers.authorization.split(' ')[1];
    }
    // console.log(token);
    if(!token){
      return  next(new AppError("Hello,Please provide a valid token",404));
    }

    //Step 3: verify the token
    const decoded = await promisify(jwt.verify) (token, process.env.JWT_SECRET);  //pass the function into promisify and call the function

    //Step 4: check if user is still Exist with provided token
        const currentUser = await User.findById(decoded.id);
    if(!currentUser){
        return next(new AppError("The user belonging to this token is no longer exists",404));
    }

    //Step 5: check if user changed password after the token was issued
    const result = currentUser.changedPasswordAfter(decoded.iat)
    if( currentUser.changedPasswordAfter(decoded.iat) ){
        return next( new AppError('User recently changed the password!, Please login again.',401) );
    }

    //Step 6: Grant access to use another route
    req.user = currentUser;
    next();


})      


exports.restirctTo = (...roles)=>{
    return (req, res, next)=>{
       
        if(!roles.includes(req.user.role)){
            return next(new AppError('You do not have permission to perform this action',403));
        }
        next();
    }
}

exports.forgetPassword = catchAsync(async(req, res, next)=>{ 
    
    //Step 1: Get user based on passed email
    const user = await User.findOne({ email : req.body.email });

    if(!user){
        return next(new AppError('There is no user exist with provided email address.',404))
    }

    //Step 2: Generate  the random  reset token not jwt token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    //Step 3: Send it to the user's email

})


exports.resetPassword = catchAsync(async(req, res, next)=>{ 
    
    //Step 1: Get user based on passed email
    const user = await User.findOne({ email : req.body.email });
    //Step 2: Generate  the random  reset token not jwt token

    //Step 3: Send it to the user's email

})

const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email')

const createSendToken = (user, statusCode, res)=>{
   
    const token = signToken(user._id);

    res.status(statusCode).json({
        status: 'success',
        token, 
        data: {
            user
        }
    })    
}

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
    
    createSendToken(newUser, 201, res); 

});



exports.login = catchAsync(async(req, res, next)=>{

    const { email, password } = req.body;

    //Step 1: check email and password exist in requested body
    if(!email || !password){
      return next(new AppError('Please provide email and passwrod!', 400));
    }

    //Step 2: check if user exists and password is correct 
    const user = await User.findOne({email}).select('+password');
    console.log(user)
    const correct = await user.correctPassword(password, user.password); 

    console.log('correct answer :',correct)

    if(!user || !correct){
        return next(new AppError('Email or password is invalid!', 401));
    }

    //Step 3: If everything ok, send the token to client    
    createSendToken(user, 200, res); 

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
    const resetUrl = `${req.protocol}://${req.hostname}:${process.env.PORT}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a Patch request with your new password and ConfirmPassword to: ${resetUrl} \n If you didn't forget your password, please ignore this email`;


    try {
        await sendEmail({
            email: 'anjanisingh953@gmail.com',
            subject: 'Your password reset token (valid for 10 minutes)',
            message
        });
    
        res.status(200).json({
            status: 'success',
            message: 'Token sent to email'
        });        
    } catch (err) {
       user.passwordResetToken = undefined;
       user.passwordResetExpires = undefined;
       await user.save({ validateBeforeSave: false });

      return next(new AppError('There was an error sending the Email. Please try again later!'),500);
    }


})


exports.resetPassword = catchAsync(async(req, res, next)=>{ 
    
    //Step 1: Get user based on passed email
     const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

     const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: {$gte: Date.now()} });
     console.log('user >>>',user)
    
     //Step 2: If token has not expired, and there is user, set the new password
     if(!user){
        return next(new AppError('Token is invalid or Expired', 400))
     }   
     
     user.password = req.body.password;
     user.confirmPassword = req.body.confirmPassword;
     user.passwordResetToken = undefined;
     user.passwordResetExpires = undefined;

     await user.save();


     //Step 3: Update changePasswordAt property for the user



    // Step 4: Log the user in, send JWT
    createSendToken(user, 200, res); 

})


exports.updatePassword = catchAsync(async(req, res, next)=>{
 
   // Step 1: Get user from the DB Collection 
    const user = await User.findById(req.user.id).select('+password');

   // Step 2: Check passed current password is correct or not
   if(!( await user.correctPassword(req.body.currentPassword, user.password) )){
     return next(new AppError('Your current password is Wrong :',401))
   }

   // Step 3: If correct, then update password
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    await user.save();   

   // Step 4: Log in User, send JWT
   createSendToken(user, 200, res);  
})
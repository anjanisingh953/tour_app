const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handleFactory');

const filterObj = (obj, ...allowedFields)=>{
    const newObj = {};
    Object.keys(obj).forEach( el=>{
        if(allowedFields.includes(el))  newObj[el] = obj[el];
    });

    return newObj;
}

exports.getMe = (req, res, next)=>{
    req.params.id = req.user.id;
    next();
}


exports.updateMe = catchAsync(async(req, res, next)=>{
    //Step 1:  Create Error if user passes a password data to update
    if(req.body.password || req.body.confirmPassword){
        return next(new AppError('This route is not for password updates, Please use /updatemypassword.',400));
    }

    //Step 2: Filtered out unwanted fields names that are not allowed to be updated
    const filterBody = filterObj(req.body, 'name', 'email');

    //Step 3: Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
        
        new: true,
        runValidators: true
   });

        res.status(200).json({
                    status: 'success',
                    data: { user: updatedUser}
        });
});


exports.deleteMe = catchAsync(async(req, res, next)=>{
     await User.findByIdAndUpdate(req.user.id, { active: false });
     res.status(204).json({
           status: 'success',
           data: null
     });


})

exports.createUser = (req,res)=>{
    
    res.status(500).json({
        status:'error',
        message: 'This route is not defined, Please use /signup instead'
    });  
};


exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);

//Below controller only for admin , Do not update password with this
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);


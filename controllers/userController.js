const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


const filterObj = (obj, ...allowedFields)=>{
    const newObj = {};
    Object.keys(obj).forEach( el=>{
        if(allowedFields.includes(el))  newObj[el] = obj[el];
    });

    return newObj;
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

exports.getAllUsers = catchAsync(async(req,res)=>{

    const users = await User.find(); 

    //Send Response
    res.status(200).json({
            status:'success',
            results: users.length,
            data:{
                users
            }
    })     
});

exports.createUser = (req,res)=>{
    
    res.status(500).json({
        status:'error',
        message: 'This route is not defined'
    });  
};

exports.getUser = (req,res)=>{

    res.status(500).json({
            status:'error',
            message: 'This route is not defined'
    });

};    

exports.updateUser = (req,res)=>{

    res.status(500).json({
        status:'error',
        message: "This route is not yet defined"
    });
};


exports.deleteUser = (req,res)=>{

    res.status(500).json({
        status:'error',
        message: 'This route is not yet defined'  
    });
};


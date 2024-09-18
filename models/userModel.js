const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({

    name:{
        type:String,
        required:[true,'Please tell us your name'],
        trim: true
    },
    email:{
        type: String,
        required:[true,'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: String,
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'

    },
    password:{
        type:String,
        required:[true,'Please provide a password'],
        minLength: [8, 'Password must a 8 digit'],
        select: false
    },
    confirmPassword:{
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            //This checks validation for password only when we create or save doc
            validator: function(el){
                return el === this.password;
            },
            message: 'Password and confirmPassword must be same'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active:{
        type: Boolean,
        default: true,
        select: false
    }

});


    userSchema.pre('save',async function(next){
        if(this.isModified('password')){

            this.password = await bcrypt.hash(this.password, 10);
            //delete confirmPassword field
            this.confirmPassword = undefined;

        }
        next();
    });


//doc middleware 
userSchema.pre('save',function(next){
    if(!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
})  

//query middleware
userSchema.pre(/^find/, function(next){

    //this points to current query

    this.find({ active: { $ne: false } });
    next();

});



// method to compare the password     
userSchema.methods.correctPassword = async function(candidatePassword, userPassword){

    return await bcrypt.compare(candidatePassword, userPassword);
}

//method to check the password is modified or not after token was issued
userSchema.methods.changedPasswordAfter = function(Jwt_TimeStamp){

    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() /1000, 10); //divide milliseconds by 1000
        return Jwt_TimeStamp < changedTimestamp;  // 200 < 300 
    }

    return false;
};


//methods to generate random password to reset the password
userSchema.methods.createPasswordResetToken = function(){

    const resetToken = crypto.randomBytes(32).toString('hex');
     
     //encrypt the generated resetToken to secure from hackers
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    console.log({resetToken}, this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;  //reset token expiration time is 10 minutes after current time

    return resetToken;
};





const User = mongoose.model('User',userSchema);     

module.exports = User;
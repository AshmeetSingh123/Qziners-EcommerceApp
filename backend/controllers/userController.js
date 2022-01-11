const User = require('../models/userModel');
const ErrorHandler = require('../utils/errorhandler');
const catchAsyncError = require('../middleware/catchAsyncErrors');
const sendToken = require('../utils/jwtToken');
const crypto = require('crypto');

const sendEmail = require('../utils/sendEmail');

//Register a User
exports.registerUser = catchAsyncError( async (req,res,next) => {

    const { name, email, password } = req.body;

    const user = await User.create({
        name,
        email,
        password,
        profilePicture:{
            public_id:'sample id',
            url:'prifilePicUrl'
        }
    });

    sendToken(user,201,res);
});

//Login a User
exports.loginUser = catchAsyncError( async (req,res,next) => {

    const { email,password } = req.body;

    //checking if user has given password and email both
    if(!email || !password){
        return next(new ErrorHandler("Please enter both Email and Password",401));
    }

    const user = await User.findOne({ email }).select("+password");

    if(!user){
        return next(new ErrorHandler("Invalid Email or Password"));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Email or Password Invalid",401));
    }

    if(isPasswordMatched){
        sendToken(user,200,res);
    }

    

})

//Logout User
exports.logoutUser = catchAsyncError( async(req,res,next) => {

    res.cookie("token",null,{
        expires: new Date(Date.now()),
        httpOnly:true
    })

    res.status(200).json({
        success:true,
        message:"Logged out successfully."
    });
});

//Forgot Password
exports.forgotPassword = catchAsyncError( async (req,res,next) => {
    const user = await User.findOne({ email: req.body.email });

    if(!user){
        return next(new ErrorHandler("User not Found.",404));
    }

    //Get Reset Password Token
    const resetToken = await user.getResetPasswordToken();

    await user.save({ validateBeforeSave:false });

    const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

    const message =  `Your password reset token is : 
        \n\n ${resetPasswordUrl}
        \n\n If you have not requested this email, then please ignore it.`;

    try{

        await sendEmail({
            email: user.email,
            subject: `Qziners Password reset`,
            message
        });

        res.status(200).json({
            success:true,
            message:`Email sent to ${user.email} successfully`,
        });

    }catch(error){
        user.getResetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave:false });

        return next(new ErrorHandler(error.message, 500));
    }
});

//Reset Password
exports.resetPassword = catchAsyncError( async (req,res,next) => {
    
    //Creating Hashed Token
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{ $gt:Date.now() }
    });

    if(!user){
        return next(new ErrorHandler("Reset Password token in invalid or has been expired.",404));
    }

    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler("Passwords don't match.",404));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user,200,res);

});

//Get User Details
exports.getUserDetails = catchAsyncError( async(req,res,next) => {

    const user = await User.findById(req.user.id);

    res.status(200).json({
        success:true,
        user
    });
});

//Update Password
exports.updatePassword = catchAsyncError( async(req,res,next) => {

    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword );

    if(!isPasswordMatched){
        return next(new ErrorHandler("Old Password is invalid",400));
    }

    if(req.body.newPassword === req.body.oldPassword){
        return next(new ErrorHandler("New Password cannot be same as Old Password.",400));
    }

    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorHandler("Passwords do not match",400));
    }

    user.password = req.body.newPassword;

    await user.save();

    sendToken(user,200,res);
});

//Update Profile
exports.updateProfile = catchAsyncError( async(req,res,next) => {

    const newUserData = {
        name:req.body.name,
        email:req.body.email
    }
    //WE WILL ADD CLOUDINARY LATER

    const user = await User.findByIdAndUpdate(req.user.id, newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    });

    res.status(200).json({
        success:true
    });
});

//Get All Users -- Admin
exports.getAllUsers = catchAsyncError( async(req,res,next) => {
    const users = await User.find();

    res.status(200).json({
        success:true,
        users
    });
});

//Get Single User Details -- Admin
exports.getSingleUserDetails = catchAsyncError( async(req,res,next) => {
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler(`User does not exist with Id: ${req.params.id}.`,404));
    }

    res.status(200).json({
        success:true,
        user
    });
});

//Update User Details including Role -- Admin
exports.updateUserRole = catchAsyncError( async(req,res,next) => {

    const newUserData = {
        name:req.body.name,
        email:req.body.email,
        role:req.body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    });

    res.status(200).json({
        success:true
    });
});

//Delete User -- Admin
exports.deleteUser = catchAsyncError( async(req,res,next) => {

    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler(`User does not exist with Id: ${req.params.id}.`,404));
    }

    await user.remove();

    res.status(200).json({
        success:true,
        message:"User successfully deleted"
    });
});
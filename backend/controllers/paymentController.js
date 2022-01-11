const ErrorHandler = require('../utils/errorhandler');
const catchAsyncError = require('../middleware/catchAsyncErrors');
const Razorpay = require('razorpay');
const dotenv = require('dotenv');

//Config ENV
dotenv.config({path:"backend/config/config.env"});

exports.processPayment = catchAsyncError( async(req,res,next) => {
    const { user, totalPrice, shippingInfo } = req.body;
    console.log(user, totalPrice, shippingInfo);
});

exports.createRazorpayOrder = catchAsyncError( async (req,res,next) => {
    
    // Instance of Razorpay
    var instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    
    const {
        user,
        totalPrice,
        shippingInfo
    } = req.body;

    instance.orders.create({
        amount:totalPrice*100,
        currency:'INR',
    }, (error, order) => {
        if(error){
            return res.status(400).json({
                success:true,
                error
            });
        }
        return res.status(201).json({ order });
    })
        
    
});
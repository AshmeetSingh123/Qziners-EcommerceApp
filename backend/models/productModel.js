const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type:String,
        trim:true,
        required: [true, "Please Enter Product Name."]
    },
    description: {
        type:String,
        required: [true, "Please Enter Product Description."]
    },
    price : {
        type: Number,
        required: [true, "Please Enter Product Price."],
        maxLength:[6, "Price cannot exceed 6 figures"]
    },
    salePrice : {
        type: Number,
        maxLength:[6, "Discounted Price cannot exceed 6 figures"]
    },
    ratings: {
        type:Number,
        default:0
    },
    images: [
        {
            public_id:{
                type:String,
                required:true
            },
            url:{
                type:String,
                required:true
            }
        }
    ],
    category:{
        type:String,
        required: [true,"Please Enter Product Category"]
    },
    stock:{
        type:Number,
        required: [true,"Please Enter Product Stock"],
        maxLength: [3, "Stock cannot exceed 999 units"],
        default:1
    },
    numOfReviews:{
        type:Number,
        default:0},
    reviews:[
        {
            user:{
                type:mongoose.Schema.ObjectId,
                ref:"User",
                required:true
            },
            name:{
                type:String,
                required:true
            },
            rating:{
                type:Number,
                required:true
            },
            comment: {
                type:String,
                required:true
            }
        }
    ],
    createdBy:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})

module.exports = mongoose.model("Product",productSchema);
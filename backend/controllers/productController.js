const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorhandler');
const catchAsyncError = require('../middleware/catchAsyncErrors');
const ApiFeatures = require('../utils/apiFeatures');
const cloudinary = require('cloudinary');


//Create a Product -- Admin
exports.createProduct = catchAsyncError( async (req,res,next) => {

    let images = [];

    if(typeof req.body.images === 'string'){
        images.push(req.body.images);
    }else{
        images = req.body.images;
    }

    const imagesLink = [];

    for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
            folder:"Products"
        });
        
        imagesLink.push({
            public_id: result.public_id,
            url: result.secure_url
        });
    }

    req.body.images = imagesLink;
    req.body.createdBy = req.user.id;

    const product = await Product.create(req.body);
    
    return res.status(201).json({
        success:true,
        product
    })
});

//Get All Products
exports.getAllProducts = catchAsyncError( async (req, res, next) => {

    const resultsPerPage = 8;
    const productsCount = await Product.countDocuments();

    const apiFeature = new ApiFeatures(Product.find(), req.query)
        .search()
        .filter()
        
    let products = await apiFeature.query;

    let filteredProductsCount = products.length;

    apiFeature.pagination(resultsPerPage);

    products = await apiFeature.query.clone();

    res.status(200).json({
        success: "true",
        products,
        productsCount,
        resultsPerPage,
        filteredProductsCount
    });
});

//Get Product Details
exports.getProductDetails = catchAsyncError( async (req,res,next) => {

    const product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHandler("Product not Found",404));
    }

    res.status(200).json({
        success:true,
        product
    })
});

//Update Product -- Admin
exports.updateProduct = catchAsyncError( async (req, res,next) => {

    let product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHandler("Product not Found",404));
    }

    let images = [];

    if(typeof req.body.images === 'string'){
        images.push(req.body.images);
    }else{
        images = req.body.images;
    }

    if(images !== undefined){
       //Deleting Images from Cloudinary
        for (let i = 0; i < product.images.length; i++) {
            await cloudinary.v2.uploader.destroy(product.images[i].public_id);
        }

        const imagesLink = [];

        for (let i = 0; i < images.length; i++) {
            const result = await cloudinary.v2.uploader.upload(images[i], {
                folder:"Products"
            });
            
            imagesLink.push({
                public_id: result.public_id,
                url: result.secure_url
            });
        }

        req.body.images = imagesLink;      
    }

      

    product = await Product.findByIdAndUpdate(req.params.id, req.body, 
        {
            new:true,
            runValidators:true,
            useFindAndModify:false
        }
    );

    res.status(200).json({
        success:true,
        product
    })
});

//Delete A Product
exports.deleteProduct = catchAsyncError( async (req,res,next) => {

    const product = await Product.findById(req.params.id);
    if(!product){
        return next(new ErrorHandler("Product not Found",404));
    }

    //Deleting Images from Cloudinary
    for (let i = 0; i < product.images.length; i++) {
        await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    await product.remove();

    res.status(200).json({
        success:true,
        message:"Product deleted successfully"
    })
});

//Create new Review or Update a Review
exports.createProductReview = catchAsyncError( async(req,res,next) => {
    
    const { rating, comment, productId } = req.body;

    const review = {
        user:req.user._id,
        name:req.user.name,
        rating:Number(rating),
        comment
    }

    const product = await Product.findById(productId);

    if(!product){
        return next(new ErrorHandler("Product not Found",404));
    }

    const isReviewed = product.reviews.find(rev => rev.user.toString() === req.user._id.toString());

    if(isReviewed){
        product.reviews.forEach(rev => {
            if(rev.user.toString() === req.user._id.toString())
            rev.rating = rating,
            rev.comment = comment
        })
    }else{
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    let avg = 0;
    product.reviews.forEach(rev => {
        avg+= rev.rating
    });
    product.ratings = avg / product.reviews.length;

    await product.save({
        validateBeforeSave: false
    });

    res.status(200).json({
        success:true
    });
});

//Get All Reviews of a Product
exports.getProductReviews = catchAsyncError( async(req,res,next) => {
    const product = await Product.findById(req.query.id);

    if(!product){
        return next(new ErrorHandler("Product not Found",404));
    }

    res.status(200).json({
        success:true,
        reviews:product.reviews
    });
});

//Delete a Review
exports.deleteReview = catchAsyncError( async(req,res,next) => {
    const product = await Product.findById(req.query.productId);

    if(!product){
        return next(new ErrorHandler("Product not Found",404));
    }

    const reviews = product.reviews.filter(rev => rev._id.toString() !== req.query.id.toString());

    let avg = 0;
    reviews.forEach((rev) => {
        avg+= rev.rating
    });
    let ratings = 0;

    if(reviews.length === 0){
        ratings = 0;
    }else{
        ratings = avg / reviews.length;
    }

    const numOfReviews = reviews.length;

    await Product.findByIdAndUpdate(
    req.query.productId,
    {
        reviews,
        ratings,
        numOfReviews
    },{
        new:true,
        runValidators:true,
        useFindAndModify: false
    });

    res.status(200).json({
        success:true,
    });
});


//ADMIN -- Get All Products
exports.getAdminProducts = catchAsyncError( async (req, res, next) => {

    const products = await Product.find();

    res.status(200).json({
        success: "true",
        products
    });
});
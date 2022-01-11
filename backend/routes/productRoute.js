const { Router } = require('express');
const express = require('express');
const { getAllProducts, getAdminProducts, createProduct, updateProduct, deleteProduct, getProductDetails, createProductReview, getProductReviews, deleteReview } = require('../controllers/productController');
const { isAuthenticatedUser, authorizeRole } = require('../middleware/authMiddleware');

const router = express.Router();

//Get All Products
router.route("/products").get( getAllProducts );

//Create a New Product
router.route("/admin/product/new").post( isAuthenticatedUser, authorizeRole("admin"), createProduct );

//Update, Delete A Product
router.route("/admin/product/:id")
.put( isAuthenticatedUser, authorizeRole("admin"), updateProduct )
.delete( isAuthenticatedUser, authorizeRole("admin"), deleteProduct );

//Get Product Info
router.route("/product/:id").get( getProductDetails );

//Create a Review
router.route("/review").put(isAuthenticatedUser, createProductReview);

//Get All Reviews or Delete a Review
router.route("/reviews").get(getProductReviews).delete(isAuthenticatedUser, deleteReview);

//Get All Products
router.route("/admin/products").get( isAuthenticatedUser, authorizeRole("admin"), getAdminProducts );

module.exports = router;
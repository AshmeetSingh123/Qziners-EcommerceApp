const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, authorizeRole } = require('../middleware/authMiddleware');
const { createRazorpayOrder } = require('../controllers/paymentController');

router.route("/payment/process").post( isAuthenticatedUser, createRazorpayOrder );


module.exports = router;
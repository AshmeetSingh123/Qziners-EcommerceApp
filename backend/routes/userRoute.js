const express = require('express');
const { 
    registerUser,
    loginUser, 
    logoutUser, 
    forgotPassword, 
    resetPassword, 
    getUserDetails, 
    updatePassword, 
    updateProfile, 
    getAllUsers, 
    getSingleUserDetails, 
    updateUserRole, 
    deleteUser } = require('../controllers/userController');
const { isAuthenticatedUser, authorizeRole } = require('../middleware/authMiddleware');
const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);
router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route("/myprofile").get( isAuthenticatedUser ,getUserDetails );
router.route("/password/update").put( isAuthenticatedUser, updatePassword );
router.route("/myprofile/update").put( isAuthenticatedUser, updateProfile );
router.route("/admin/users").get(isAuthenticatedUser, authorizeRole("admin"), getAllUsers);
router.route("/admin/user/:id")
    .get(isAuthenticatedUser, authorizeRole("admin"), getSingleUserDetails)
    .put(isAuthenticatedUser, authorizeRole("admin"), updateUserRole)
    .delete(isAuthenticatedUser, authorizeRole("admin"), deleteUser);
router.route("/admin/")

module.exports = router;
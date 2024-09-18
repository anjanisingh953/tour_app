const express = require('express');
const userController = require('../controllers/userController')
const authController = require('../controllers/authController');
const router = express.Router();

router.post('/signup',authController.signup);
router.post('/login',authController.login);
router.post('/forgotpassword',authController.forgetPassword);
router.patch('/resetpassword/:token',authController.resetPassword);
router.patch('/updatemypassword', authController.protect, authController.updatePassword);
router.patch('/updateme', authController.protect, userController.updateMe);
router.delete('/deleteme', authController.protect, userController.deleteMe);

router.route('/').get(authController.protect,userController.getAllUsers).post(userController.createUser);
router.route('/:id').post(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser);

module.exports = router;
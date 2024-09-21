const express = require('express');
const userController = require('../controllers/userController')
const authController = require('../controllers/authController');
const router = express.Router();

router.post('/signup',authController.signup);
router.post('/login',authController.login);
router.post('/forgotpassword',authController.forgetPassword);
router.patch('/resetpassword/:token',authController.resetPassword);

//Protect all routers after this middleware
router.use(authController.protect);

router.patch('/updatemypassword',authController.updatePassword);
router.patch('/updateme',userController.updateMe);
router.delete('/deleteme',userController.deleteMe);
router.get('/me',userController.getMe, userController.getUser);

//Restrict all routers after this middleware
router.use(authController.restirctTo('admin'));

router.route('/').get(userController.getAllUsers).post(userController.createUser);
router.route('/:id').post(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser);



module.exports = router;
const express = require('express');
const userController = require('../controllers/userController')
const authController = require('../controllers/authController');
const router = express.Router();

router.post('/signup',authController.signup);
router.post('/login',authController.login);
router.post('/forgetpassword',authController.forgetPassword);
router.post('/resetpassword',authController.resetPassword);


router.route('/').get(authController.protect,userController.getAllUsers).post(userController.createUser);
router.route('/:id').post(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser);

module.exports = router;
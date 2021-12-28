const express = require('express')
const router = express.Router()
const authRoutes = require('../middlewares/auth')
const { registerUser, loginUser, forgotPassword, resetPassword, logoutUser } = require('../controllers/authController')


//create new users route
router.route('/register').post(registerUser)

//login user route
router.route('/login').post(loginUser)

//forgot password route
router.route('/password/forgot').post(forgotPassword)

//reset password route
router.route('/password/reset/:token').put(resetPassword)

//logout user
router.route('/logout').get(logoutUser)


module.exports = router
const express = require('express')
const router = express.Router()
const authRoutes = require('../middlewares/auth')
const { getUserProfile, 
        updatePassword, 
        updateProfile, 
        deleteUser,
        getUsers,
        allAppliedJobs ,
        userAppliedJobs,
        adminDeleteUser } = require('../controllers/userController')

//get user profile
router.route('/me').get(authRoutes, getUserProfile)

//reset password route
router.route('/password/update').put(authRoutes, updatePassword)

//update user details
router.route('/update/me').put(authRoutes, updateProfile)

//show employer applied jobs
router.route('/jobs/applied').get(authRoutes, allAppliedJobs)

//show all jobs applied by user
router.route('/jobs/me/applied').get(authRoutes, userAppliedJobs)

//delete user account
router.route('/delete/me').delete(authRoutes, deleteUser)


//admin routes
//show all users 
router.route('/admin/user').get(authRoutes, getUsers)

//delete user
router.route('/admin/user/:id').delete(adminDeleteUser)


module.exports = router
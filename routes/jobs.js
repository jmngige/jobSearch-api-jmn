const express = require('express')
const router = express.Router()
const authRoutes = require('../middlewares/auth')
const { getJobs, newJob, searchJobsInRange, updateJobs,
    deleteJob, getJobById, uploadResume } = require('../controllers/jobControllers')

//creating new job route
router.route('/jobs/new').post(authRoutes, newJob)

//Getting  all jobs from the database
router.route('/jobs').get(authRoutes, getJobs)

//Getting a job using its id
router.route('/jobs/:id').get(authRoutes, getJobById)

//search for jobs within range
router.route('/jobs/:zipcode/:distance').get(authRoutes, searchJobsInRange)

//Update jobs details
router.route('/jobs/:id').patch(authRoutes, updateJobs)

//upload cv for job application
router.route('/job/:id/apply').put(uploadResume)

//Route to delete a job
router.route('/jobs/:').delete(authRoutes, deleteJob)


module.exports = router

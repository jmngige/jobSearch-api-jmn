const Job = require('../models/Jobs')
const geoCoder = require('../utils/geocoder')
const ErrorHandler = require('../utils/errHandler')
const ApiFilters = require('../utils/apiFilters')
const catchAsyncErrors = require('../middlewares/catchAsyncErrors')
const path = require('path')
const fs = require('fs')

//Create new job // api/v1/job/new
exports.newJob = catchAsyncErrors( async (req, res, next)=>{

    req.body.user = req.user.id

    const job = await new Job(req.body)

    await job.save().then(()=>{
        res.send(job)
    }).catch((err)=>{
        res.send(err)
    })
})

//Get all jobs in the database
exports.getJobs = async (req, res, next)=>{

    const apiFilters = new ApiFilters(Job.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination()
    // .rawQuery()

    const jobs  = await apiFilters.query

    res.status(200).send({
        count: jobs.length,
        data: jobs
    })
}

//Get jobs in the database by job id
exports.getJobById = async (req, res, next)=>{
    const id = req.params.id

    const job = await Job.findById(id)
    if(!job){
        return next(new ErrorHandler("Job not found", 404))
    }

    res.send({
        success: true,
        message: 'Job found successfully',
        job
    })
}

//search all jobs within a desired range
exports.searchJobsInRange = async (req, res, next)=>{
    const { zipcode, distance } = req.params

    const loc = await geoCoder.geocode(zipcode)

    const longitude = loc[0].longitude
    const latitude = loc[0].latitude

    const radius = distance / 6963

    const jobs = await Job.find({
        location: {$geoWithin : {$centerSphere : [[longitude, latitude], radius]}}
    }) 

    res.status(200).send({
        success: true,
        data: jobs
    })
}

//Update job details by Job id
exports.updateJobs = async (req, res, next)=>{ 

    const id = req.params.id

    const jobs = await Job.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })

    if(!jobs){
        return next(new ErrorHandler("Job not found", 404))
    }

    if(jobs.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorHandler("Not authorised to perfom Updates", 400))
    }

    res.status(200).send({
        success: true,
        message: 'Updated successfully',
        data: jobs
    })

}

//Upload job application resume
exports.uploadResume = async(req, res, next)=>{

    const job = await Job.findById(req.params.id).select('+applicantsApplied')

    if(!job){
        return next(new ErrorHandler("Job not found Please try another", 404))
    }

    //ensure the right user is updating this job
    if(job.user.toString() !== req.user.id && req.user.role === "admin"){
        return next(new ErroHandler("You're not allowed to perform this operation",400))
    }

    //check if user has already applied for the job
    for(let i = 0; i<job.applicantsApplied.length; i++){
        if(job.applicantsApplied[i].id === req.user.id){
            return next(new ErroHandler("You've already applied for the job", 400))
        }
    }

    //check job has not expired from posting date
    if(job.lastDate < new Date(Date.now())){
        return next(new ErrorHandler("Job application submissions have expired", 400))
    }

    //check if any files exist already
    if(!req.files){
        return next(new ErrorHandler("Please upload your resume", 400))
    }

    //refer to file 
    const file = req.files.file

    //check the file is of supported format
    const format = /.docx | .pdf | .docs/

    if(!format.test(path.extname(file.name))){
        return next(new ErrorHandler("File upload format not supported", 400))
    }

    //check file size
    if(file.size > process.env.FILE_SIZE){
        return next(new ErrorHandler("File size should be 2 mbs or less", 400))
    }

    //rename the document before upload
    file.name = `${req.user.name.replace(' ','_')}.${job._id}${path.parse(file.name).ext}`

    //upload the application file
    file.mv(`${process.env.UPLOAD_PATH}/${file.name}`, async err =>{
        if(err){
            return next(new ErrorHandler("Upload failed. Please try again", 500))
        }

        //upload to db
        await Job.findByIdAndUpdate(req.params.id, {$push : {
            applicantsApplied :{
                user: req.user.id,
                resume: file.name
            }
        }},{
            new: true,
            runValidators: true,
            useFindAndModify: false
        })
    })

    res.status(200).json({
        success: true,
        message: "Resume uploaded successfully",
        data: file.name
    })

}


//Delete a job from the database by its id
exports.deleteJob = async (req, res, next)=>{
    const id = req.params.id

    const job = await Job.findById(id).select('+applicantsApplied')
    

    if(!job){
        return next(new ErrorHandler("Job not found", 404))
    }

    if(jobs.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorHandler("Not authorised to delete jobs", 400))
    }
    //delete files associated with job
    const jobObj = await Job.findOne({_id: req.params.id}).select('+applicantsApplied')

    for(let i=0; i<jobObj.applicantsApplied.length; i++){
        let filePath = `${__dirname}/public/uploads/${jobObj.applicantsApplied[i].resume}`
        .replace('//controllers', '')
    }
    fs.unlink(filePath, err =>{
        if(err) return console.log(err)
    })

    await Job.findByIdAndDelete(req.params.id)

    res.status(200).send({
        success: true,
        message: 'Job deleted successfully'
    })
}


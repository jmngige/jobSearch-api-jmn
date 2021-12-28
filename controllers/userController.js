const User = require('../models/users')
const Job = require('../models/Jobs')
const ErrorHandler = require('../utils/errHandler')
const saveToken = require('../utils/saveToken')
const fs = require('fs')
const ApiFilters = require('../utils/apiFilters')


exports.getUserProfile = async (req, res, next)=>{

    const user = await User.findById(req.user.id)
                        .populate({
                           path: 'jobsPublished',
                           select: 'title postingDate jobType'
                        })


    res.json({
        success: true,
        data: user
    })

}

exports.updatePassword = async (req, res, next)=>{

    const user = await User.findById(req.user.id).select('+password')
    const isMatch = await user.comparePassword(req.body.oldPassword)

    if(!isMatch){
        return next(new ErrorHandler("Old password entered is incorrect", 404))
    }

    user.password = req.body.newPassword

    await user.save()

   saveToken(user, 200, res)
}

exports.updateProfile = async(req, res, next)=>{
    const newData = {
        email: req.body.email,
        name: req.body.name
    }


    const user = await User.findByIdAndUpdate(req.user.id, newData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    saveToken(user, 200, res)
}

exports.allAppliedJobs = async (req, res, next)=>{

    const uid = req.user.id

    const jobs = await Job.find({uid}).select('+applicantsApplied')
    if(!jobs){
        return next(new ErrorHandler("No job applications have been submitted yet", 400))
    }

    res.status(200).json({
        success: true,
        data: jobs
    })
}

exports.userAppliedJobs = async (req, res, next)=>{

    const jobs = await Job.findMany({user: req.user.id})

    if(!jobs){
        return next(new ErrorHandler("You have not applied for any jobs yet. Go to Job applications tab and apply", 400))
    }

    res.status(200).json({
        success: true,
        jobs
    })

}

exports.deleteUser = async (req, res, next)=>{

    deleteUserData(req.user.id, req.user.role)

    const user = await User.findByIdAndDelete(req.user.id)

    res.cookie('token', 'none',{
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message: "Account deleted successfully"
    })
}

async function deleteUserData(user_id, role){

    if(role === "employer"){
        await Job.deleteMany({user_id})
    }

    if(role === "user"){
        //get all the jobs applied by the user
        const appliedJobs = await Job.find({user_id}).select('+applicantsApplied')

        //loop across all jobs applied by the user
        for(let i=o; i<appliedJobs.length; i++){
            const obj = appliedJobs[i].applicantsApplied.find(o => o.id === user_id)

            //generate filePath 
            const filePath = `${__dirname}/public/uploads/${obj.resume}`.replace('//controllers','')

            //use the fs to delete the files
            fs.unlink(filepath, err =>{
                if(err) return console.log(err)
            })
            
            //delete the file from the applied jobs array
            appliedJobs[i].applicantsApplied.splice(appliedJobs[i].applicantsApplied.indexOf(obj.id))

            await appliedJobs[i].save()
        }

    }

}

//admin get all registered users
exports.getUsers = async(req, res, next)=>{

    const apiFilters = new ApiFilters(User.find(), req.query)
                        .filter()
                        .sort()
                        .pagination()
                        .limitFields()

    const users = await apiFilters.query
    
                  
    res.status(200).json({
        success: true,
        users
    })
}

//admin delete single users
exports.adminDeleteUser = async (req, res, next)=>{
    const user = await User.findById(req.params.id)
    if(!user){
        return next(new ErrorHandler("No user by that id exists", 400))
    }

    deleteUserData(user.id, user.role)
    await user.remove()

    res.status(200).json({
        success: true,
        message: "User deleted successfully"
    })
}
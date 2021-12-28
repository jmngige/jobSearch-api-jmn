const User = require('../models/users')
const ErrorHandler = require("../utils/errHandler")
const saveToken = require('../utils/saveToken')
const sendEmail = require('../utils/sendEmail')
const crypto = require('crypto')

exports.registerUser = async (req, res, next)=>{
    const {name, email, role, password} = req.body

    const user = await User.create({
        name,
        email,
        role,
        password
    })

    saveToken(user, 200, res)
}

//login route 
exports.loginUser = async (req, res, next)=>{

    const {email , password} = req.body

    if(!email || !password){
        return next(new ErrorHandler("Please enter all your login credentials"))
    }

    const user = await User.findOne({email}).select('+password')
    if(!user){
        return next(new ErrorHandler("Invalid email or password", 400))
    }

    const isMatch = await user.comparePassword(password)
    if(!isMatch){
        return next(new ErrorHandler("Invalid email or password"))
    }

    saveToken(user, 200, res)

}

exports.forgotPassword = async (req, res, next)=>{

    const user = await User.findOne({email: req.body.email})

    if(!user){
        return next(new ErrorHandler("Account with that email not found"))
    }

    const resetToken = await user.generateResetPasswordToken()

    await user.save({ validateBeforeSave: false })

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`

    const message = `Click the link below to reset password\n\n${resetUrl}\n\nignore this if you did not make the request`

    try{
    await sendEmail({
        email: user.email,
        subject: `Password reset Email`,
        message

    })

    res.status(200).json({
        success: true,
        message: `Email sent successfully to ${user.email}`
    })

} catch(err){

        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined

        await user.save({validateBeforeSave: false})
        return next(new ErroHandler("Error occured please try again in a few minutes"))

    }

}

exports.resetPassword = async (req, res, next)=>{

    const resetPassToken = crypto
                            .createHash('sha256')
                            .update(req.params.token)
                            .digest('hex')

    const user = await User.findOne({resetPassToken, resetPasswwordexpire: {$gt : Date.now()}})

    if(!user){
        return next(new ErrorHandler('Invalid token. Please try sending the request email again', 400))
    
    }

    //set the parameters
    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswwordexpire = undefined

    await user.save()

    saveToken(user, 200, res)

}

//logout user route
exports.logoutUser = async (req, res, next)=>{
    res.cookie('token', 'none', {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message: "Logged out successfully"
    })
}
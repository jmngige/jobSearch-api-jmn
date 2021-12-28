const ErrorHandler = require('../utils/errHandler')
const jwt = require('jsonwebtoken')
const User = require('../models/users')

const authRoutes = async (req, res, next)=>{

    let token

    try{
        //get token from the Bearer in the authorization header
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        token = req.headers.authorization.split(' ')[1]
    }
    if(!token){
        return next(new ErrorHandler('Please register or login first', 401))
    }

    const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY)
    const user = await User.findById(decoded.id)

    if(!user){
        return next(new ErrorHandler("such user doesn't exist", 400))
    }

    req.user = user
    
    }catch(err){
        return next(new ErrorHandler("Please register or login first", 401))
    }

    next()
}

module.exports = authRoutes
const ErrorHandler = require('../utils/errHandler')

module.exports = (err, req, res, next)=>{
    err.statusCode = err.statusCode || 500
    err.message = err.message || "Internal server error"

    if(process.env.NODE_ENV === 'development'){
        res.status(err.statusCode)
        .send({
            success: false,
            message: err.message,
            stack: err.stack
        
        })
    }

    if(process.env.NODE_ENV === 'production'){
        let error = { ...err }

        //handling wrong mongoose object id
        if(err.name === 'CastError'){
            const message = `Resource not foundd. Invalid ${err.path}`
            error = new ErrorHandler(message, 404)
        }

        if(err.name === 'ValidationError'){
            const message = Object.values(err.errors).map(value => value.message)
            error = new ErrorHandler(message, 400)
        }

        if(err.name = 'JsonWebTokenError'){
            const message = 'Json web Tken is invalid, please try againa'
            error = new ErrorHandler(message, 500)
        }

        if(err.name = "TokenExpiredError"){
            const message = "Please Login or Signup"
            error = new ErrorHandler(message, 500)
        }

        //Handling mongoose dublicate errors
        if(err.code === 11000){
            const message = `Duplicate ${Object.keys(err.keyValues)} found `
            error = new ErrorHandler(message, 400)
        }

        error.message = err.message

        res.status(err.statusCode)
            .send({
                success: false,
                error: error.message
            })
    }
}



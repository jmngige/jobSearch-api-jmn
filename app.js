const express = require('express')
const jobsRouter = require('./routes/jobs')
const authRouter = require('./routes/auth')
const usersRouter = require('./routes/user')
const app = express()
const dbConnection = require('./db/mongoose')
const errorHandler = require('./middlewares/errors')
const ErrorHandler = require('./utils/errHandler')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xssClean = require('xss-clean')
const hpp = require('hpp')
const cors = require('cors')
const bodyParser = require('body-parser')

//handle uncaught Exceptions
process.on('uncaughtException', err=>{
    console.log(`Error: ${err.message}`)
    process.exit(1)
})

//initialize db connection
dbConnection()


app.use(express.json())
app.use('/api/v1' , jobsRouter)
app.use('/api/v1', authRouter)
app.use('/api/v1', usersRouter)


//setup body parser
app.use(bodyParser.urlencoded({extended: true}))

app.use(express.static('public'))


//handling unhandled routes. errors
app.all('*', (req, res, next)=>{
    next(new ErrorHandler(`${req.originalUrl} route not found`, 404))
})

//Initializing middlewares
app.use(errorHandler)
//cookie parser
app.use(cookieParser)
//implement express file uploads
app.use(fileUpload)
//Implement rate limiting for our apis
// const limiter = rateLimit({
//     windowMs: 10*60*1000, //20 minutes
//     max: 2 //maximum number of calls that can be made in our api routes
// })
// app.use(limiter)
//implement http headers security with helmet
app.use(helmet())

//prevent malicious html tags in the database
app.use(mongoSanitize())

//prevent xss attacks from scripts
app.use(xssClean())

//prevent parameters pollution
app.use(hpp())

//implement  cors into our website
//This will help other domains to access our api services
app.use(cors())

const server = app.listen(process.env.PORT, ()=>{
    console.log(`Server is up and running on port ${process.env.PORT} on ${process.env.NODE_ENV} mode`)
})

//handling unhandles Promise rejections
process.on('unhandledRejection', err=>{
    console.log(`Error: ${err.message}`)
    console.log(err)
    server.close(()=>{
        process.exit(1)
    })
})


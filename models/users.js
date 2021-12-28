const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"]
    },
    email: {
        type: String,
        maxlength: 50,
        required: true,
        lowercase: true,
        unique: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Please enter a valid email address')
            }
        }
    },
    role: {
        type: String,
        enum: {
            values: ['user', 'employer'],
            message: 'Please chose the correct role'
        },
        default: 'user',
    },
    password: {
        type: String,
        select: false,
        minlength: [8, 'Password is too short'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: String,
    resetPasswwordexpire: Date
},{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
})

//encrypting passwords
userSchema.pre('save', async function(next){
    const user = this
    if(user.isModified('password')){
        this.password = await bcrypt.hash(this.password, 10)
    }

    next()
})

userSchema.methods.generateJWT = function(){
    return  jwt.sign({id: this._id}, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRY
    })
}

userSchema.methods.comparePassword = async function(ePassword){
    
        return await bcrypt.compare(ePassword, this.password)  
}

userSchema.methods.generateResetPasswordToken = async function(){
    
    const token = await crypto.randomBytes(20).toString('hex')
    this.resetPasswordToken = await crypto
                                    .createHash('sha256')
                                    .update(token)
                                    .digest('hex')

    this.resetPasswwordexpire = Date.now() + 30*60*1000

    return token
}

userSchema.virtual('jobsPublished', {
    ref: 'Job',
    localField: '_id',
    foreignField: 'user',
    justOne: false
})

const user  = mongoose.model('User', userSchema)
module.exports = user
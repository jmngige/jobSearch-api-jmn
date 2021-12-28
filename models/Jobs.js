const mongoose = require('mongoose')
const validator = require('validator')
const slugify = require('slugify')
const geoCoder = require('../utils/geocoder.js')

const jobSchema = new mongoose.Schema({
    title:{
        type: String,
        required:[true, 'Please enter job title'],
        trim: true,
        maxlength: [100, 'Job title cannot exceed 100 words']

    },
    slug: String,
    description: {
        type: String,
        required: [true, 'Please enter the job descriprion'],
        maxlength: [1000, 'Job description cannot exceed 1000 words']
    },
    email: {
        type: String,
        required: [true, 'Enter your email address bro'],
        trim: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Please Enter a valida email address')
            }
        }

    },
    location: {
        type : {
            type: String,
            enum: ['Point']
        },
        coordinates : {
            type: [Number],
            index: '2dsphere'
        },
        formattedAddress: String,
        city: String,
        state: String,
        zipcode: String,
        country: String
    },
    address: {
        type: String,
        required: [true, 'Please enter your address']
    },
    company: {
        type: String,
        required: [true, 'Please enter company name']
    },
    industry: {
        type: [String],
        required: true,
        enum: {
            values: [
                'Technology',
                'Health',
                'Digital Marketing',
                'Banking and Accounting',
                'Agricultural',
                'Education',
                'Engineering',
                'Other'
            ],
            message: 'Please select the intrested industry field(s)'
        }
    },
    jobType:{
        type: String,
        required: true,
        enum: {
            values: [
                'Internship',
                'Temporary',
                'Full-time'
            ],
            message: 'Please select the field you are applying for'
        }
    },
    minEducation: {
        type: String,
        required: true,
        enum: {
            values: [
                'Certificate',
                'Diploma',
                'Bachelor\'s Degree',
                'Masters degree',
                'PHD'
                ],
                message: 'Please Indicate your minimum level of education achieved'
        }
    },
    positions: {
        type: Number,
        default: 1
    },
    experience: {
        type: String,
        required: true,
        enum: {
            values: [
                'Less than 1 year',
                '1 year - 2 years',
                '2 years - 5 years',
                '5+ years'
            ],
            message: 'Please select years of experience you have'
        }
    },
    salary: {
        type: Number,
        required: [true, 'Enter your expected salary']
    },
    postingDate: {
        type: Date,
        default: Date.now
    },
    lastDate: {
        type: Date,
        default: new Date().setDate(new Date().getDate() + 14 )
    },
    applicantsApplied: {
        type: [Object],
        select: false
    },
    user : {
        type: mongoose.Schema.ObjectId,
        ref: "User"
    }
})

//Creating slug middleware
jobSchema.pre('save', function(next){
    this.slug = slugify(this.title, { lower: true })

    next()
})

//Creating location for jobs
jobSchema.pre('save', async function(next){

    const loc = await geoCoder.geocode(this.address)

    this.location = {
        type: 'Point',
        coordinates: [ loc[0].longitude, loc[0].latitude],
        formattedAddress: loc[0].formattedAddress,
        city: loc[0].city,
        state: loc[0].stateCode,
        zipcode: loc[0].zipcode,
        country: loc[0].countryCode
    }

    next()
})

module.exports = mongoose.model('Job', jobSchema)
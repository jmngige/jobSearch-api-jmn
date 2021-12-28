const nodemailer = require('nodemailer')

const sendEmail = options =>{
    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.c,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    })

    const message = {
        from: `${process.env.MAIL_NAME} <${process.env.MAIL_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message
    }

    transporter.sendMail(message)
}

module.exports = sendEmail
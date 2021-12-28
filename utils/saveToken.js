//saving token in cookies instead of db bc of csrf xss
module.exports = (user, statusCode, res, req)=>{
    //generate token
    const token = user.generateJWT()

    //define your options object
    const options = {
        expires: new Date(Date.now() + process.env.TiK_Tok_Token * 24 * 30 * 30 * 1000),
        httpOnly: true
    }

    //render the token
    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token
        })
}


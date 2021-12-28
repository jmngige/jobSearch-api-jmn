const mongoose = require('mongoose')

const dbConnect = ()=>{
    mongoose.connect( process.env.MONGO_DB_URL, {useNewUrlParser: true,
        useUnifiedTopology: true}).then(con => {
            console.log(`Connection at ${con.connection.host}`)
        })
}

module.exports = dbConnect
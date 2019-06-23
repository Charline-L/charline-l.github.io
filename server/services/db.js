/*
* Imports
* */
const mongoose = require("mongoose")


/*
* Configuration
* */
const connect = () => {
    mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true } )
        .then(
            () => console.log('Mongo is alive'),
            (error) => console.log(`Not connected ${error}`)
        )
}


/*
* Exports
* */
module.exports = { connect }
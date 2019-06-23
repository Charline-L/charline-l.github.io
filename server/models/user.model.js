/*
* Imports
* */
const mongoose = require("mongoose")
const {Schema} = mongoose
const jwt = require('jsonwebtoken')
require('dotenv').config()

/*
* Définition
* */
const userSchema = new Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    postal: String,
    phoneNumber: String
})

/*
* Méthode
* */
userSchema.methods.generateJwt = function generateJwt(){

    // défini une expiration
    const expiry = new Date()
    expiry.setDate(expiry.getDate() + 59)

    // JWT creation
    return jwt.sign({
        _id : this._id,
        email: this.email,
        password: this.password,
        expiresIn: '10s',
        exp: parseInt(expiry.getTime() / 100, 10),
    }, process.env.JWT_SECRET)
}

/*
* Export
* */
const UserModel = mongoose.model('user', userSchema);
module.exports = UserModel
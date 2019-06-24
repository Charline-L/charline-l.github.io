/*
* Imports
* */
const mongoose = require("mongoose")
const {Schema} = mongoose

/*
* Définition
* */
const citySchema = new Schema({
    longitude: Number,
    latitude: Number,
    nom_commune: String
})


/*
* Export
* */
const CityModel = mongoose.model('city', citySchema);
module.exports = CityModel
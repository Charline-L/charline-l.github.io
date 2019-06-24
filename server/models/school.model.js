/*
* Imports
* */
const mongoose = require("mongoose")
const {Schema} = mongoose

/*
* Définition
* */
const schoolSchema = new Schema({
    datasetid: String,
    recordid: String,
    fields: Object,
    geometry: Object,
    record_timestamp: String
})


/*
* Export
* */
const SchoolModel = mongoose.model('school', schoolSchema);
module.exports = SchoolModel
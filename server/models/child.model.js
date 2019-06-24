/*
* Imports
* */
const mongoose = require("mongoose")
const {Schema} = mongoose

/*
* Définition
* */
const childSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'user' },
    name: String,
    color: String,
    city: String,
    school: String,
})


/*
* Export
* */
const ChildModel = mongoose.model('child', childSchema);
module.exports = ChildModel
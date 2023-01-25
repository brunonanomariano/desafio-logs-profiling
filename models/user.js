const mongoose = require('mongoose')
const collection = "users"

const userSchema = new mongoose.Schema({
    username: String,
    password: String
})

module.exports = mongoose.model(collection, userSchema)
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },

    completed: {
        type: Boolean,
        default: false
    },

    owner: {
        type: mongoose.Schema.Types.ObjectID,
        required: true,
        ref: 'User'
    }

},{
    timestamps: true
})

module.exports = Task = mongoose.model('Task', userSchema)
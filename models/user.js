const mongoose = require("mongoose");

const passportLocalmongoose = require("passport-local-mongoose");
const userScehma = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
});

userScehma.plugin(passportLocalmongoose);

module.exports = mongoose.model("User", userScehma);
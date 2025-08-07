const mongoose = require("mongoose");
const reviewScehma = new mongoose.Schema({
    comment: {
        type: String
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});
module.exports = mongoose.model("Review",reviewScehma);
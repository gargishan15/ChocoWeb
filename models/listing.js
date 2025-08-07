const mongoose = require("mongoose");
const reviews = require("./reviews");
const listingSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    description: {
        type: String
    },
    price: {
        type: Number
    },
    image:{
        type:String,
        default: "https://plus.unsplash.com/premium_photo-1668024966086-bd66ba04262f?q=80&w=2092&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        set: (v) =>
           v === ""
         ? "https://plus.unsplash.com/premium_photo-1668024966086-bd66ba04262f?q=80&w=2092&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
         : v,
    },
    location:{
        type: String
    },
    country:{
        type: String
    },
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports= Listing;
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js")
main()
.then(()=>{
    console.log("connection successful");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
}
const initDb = async()=>{
    await Listing.deleteMany({});
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
}
initDb();
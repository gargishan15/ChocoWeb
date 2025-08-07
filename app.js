const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const Review = require("./models/reviews.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const dotenv = require("dotenv");

dotenv.config();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
const PORT = process.env.PORT || 5000;

const sessionOptions = {
    secret: " mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};



main()
.then(()=>{
    console.log("connection successful");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
}


app.get("/", (req, res)=>{
    res.send("Hi Im working");
})

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

app.get("/listings", async (req,res)=>{
    const allListings = await Listing.find({})
        res.render("listings/index.ejs",{allListings});
});
app.get("/listings/new", (req,res)=>{ 
    console.log(req.user);
    if(!req.isAuthenticated()){
        req.flash("error", "You must be logged in to create listing!");
       return res.redirect("/login");
    }
    res.render("listings/new.ejs");
})

app.get("/listings/:id", async (req, res)=>{
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", {listing});
})

app.post("/listings", async(req, res)=>{
    let{ title, description, image, price, location, country} = req.body;
    let newList = new Listing({
        title: title,
        description: description,
        image: image,
        price: price,
        location: location,
        country: country
    });
    await newList.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
});

app.get("/listings/:id/edit", async(req,res)=>{
    if(!req.isAuthenticated()){
        req.flash("error", "You must be logged in to create listing!");
       return res.redirect("/login");
    }
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
});
app.put("/listings/:id" , async(req, res)=>{
    if(!req.isAuthenticated()){
        req.flash("error", "You must be logged in to create listing!");
       return res.redirect("/login");
    }
     let { id } = req.params;
     await Listing.findByIdAndUpdate(id,req.body);
     req.flash("success", "Listing Updated!");
     res.redirect("/listings");
})
app.delete("/listings/:id" , async(req, res)=>{
    if(!req.isAuthenticated()){
        req.flash("error", "You must be logged in to create listing!");
       return res.redirect("/login");
    }
     let { id } = req.params;
     let deletedlisting = await Listing.findByIdAndDelete(id);
     console.log(deletedlisting);
     req.flash("success", "Listing Deleted!");
     res.redirect("/listings");
});     

app.post("/listings/:id/reviews", async(req, res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    req.flash("success", "New Review Created!");
    res.redirect(`/listings/${listing._id}`);
});

app.delete("/listings/:id/reviews/:reviewId", async(req, res)=>{
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}})
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
});

app.get("/signup", (req, res)=>{
    res.render("users/signup.ejs");
});

app.post("/signup" , async(req, res)=>{
    let {username, email, password } = req.body;
    const newUser = new User({email, username});
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.login(registeredUser, (err)=>{
        if(err){
            return next(err);
        }
         req.flash("success", "Welcome to AirBnB");
         res.redirect("/listings");
    })
});

app.get("/login", (req,res)=>{
    res.render("users/login.ejs");
});

app.post("/login",passport.authenticate("local", {
    failureRedirect: "/login", 
    failureFlash: true,
}), 
async(req, res)=>{
    req.flash("success","Welcome back to AirBnB");
    res.redirect("/listings");
})

app.get("/logout", (req, res)=>{
    req.logout((err) => {
        if(err){
            next(err);
        }
        req.flash("success", "you are logged out!");
        res.redirect("/listings");
    })
})

app.listen(PORT, ()=>{
    console.log("app is listening on port " + PORT);
});
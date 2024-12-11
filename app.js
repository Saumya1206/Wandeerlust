const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
// const Listing = require(path.join(__dirname, 'models', 'listing.js'));
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");

const listingRouter  = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStartegy = require("passport-local");
const User = require("./models/user.js");


const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main().then(() => {
    console.log("Connected to DB");
})
.catch((err)=> {
    console.log(err);
});


async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const sessionOptions = {
    secret : "mysupersecretcode",
    resave : false,
    saveUnitialised: true,
    cookie: {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly : true
    },
};

app.get("/", (req,res) => {
    res.send("Hi, I am root");
});

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStartegy(User.authenticate()));
passport.serializeUser(User.serializeUser());
  
  passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.curUser = req.user;
    console.log(req.user);
    //console.log("success");
    next();
});

// app.get("/demouser", async(req,res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username : "delta-student"

//     });
//      let registeredUser = await User.register(fakeUser, "helloworld");
//      res.send(registeredUser);
// })

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);



//const session = require('express-session');

// app.use(session({
//   secret: 'your-secret-key', // Replace with your secret key
//   resave: false, // Whether to save the session back to the store even if it wasn't modified
//   saveUninitialized: true, // <--- This is the option causing the error
//   cookie: { secure: false } // Add other options as needed
// }));











const validateListing = (req, res, next) => {
    let {error } = listingSchema.validate(req.body);
    //const newListing = new Listing(req.body.listing);
    if (error){
        let errormsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errormsg);
    } else {
        next();
    }

};

const validateReview = (req, res, next) => {
    let {error } = reviewSchema.validate(req.body);
    //const newListing = new Listing(req.body.listing);
    if (error){
        let errormsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errormsg);
    } else {
        next();
    }

};




//Index Route
app.get("/listings", wrapAsync (async (req,res) => {
    const allListing =await Listing.find({});
   // res.render("/listings/index.ejs", {allListing});
   res.render("listings/index", { allListing });
    // .then(res => {
    //     console.log(res);
    // });
}));

//New Route
app.get("/listings/new", wrapAsync (async(req,res)=> {
    res.render("listings/new");
}));

//Show Route

app.get("/listings/:id", wrapAsync (async(req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show", { listing});

}));
 //Create Route
//  app.post("/listings",  async (req,res)=> {
//    // let {title, description, image, price, location, country} = req.body;
//    //let listing = req.body.listing;
//    const newListing = new Listing(req.body.listing);
//     await newListing.save();
//    //console.log(listing);
//    res.redirect("/listings");

//  });
 app.post("/listings", validateListing, wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
  })
);
// app.post("/listings", 
//     wrapAsync (async (req, res, next) => {
//     // if(!req.body.listings){
//     //     throw new ExpressError(400, "Send Valid data for listing");
//     // };
//     let result = listingSchema.validate(req.body);
//     const newListing = new Listing(req.body.listing);
//     if (result.error){
//         throw new ExpressError(400, result.error);
//     }
//     // try {
//         await newListing.save();
//         res.redirect("/listings");
//     // } catch (error) {
//     //     // console.error(error.errors); // Log specific validation errors
//     //     // res.status(400).send('Listing validation failed');
//     //     next(err);
//     // }
// }));

//Edit Route
app.get("/listings/:id/edit",  wrapAsync (async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit", {listing});

}));

//Update Route
app.put("/listings/:id",validateListing, wrapAsync (async (req,res) => {
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    // res.redirect("/listings");
    res.redirect(`/listings/${id}`);

}));

//Delete Route
app.delete("/listings/:id", wrapAsync (async(req,res) => {
    let {id} = req.params;
    let deletedListing =  await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");

}));





//REVIEWS
//POST  review ROUTE
app.post("/listings/:id/reviews", validateReview,  wrapAsync(async(req,res) => {
  try{  let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    console.log("reviews saved");
   // res.send("new review saved");
   res.redirect(`/listings/${listing._id}`);
} catch (e) {
    console.error(e);
    res.redirect(`/listings/${req.params.id}`);
}
}));

//delete review route
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async(req,res) => {
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
}

))




// app.get("/testListing", async (req,res) => {
//     let sampleListing = new Listing ({
//         title: "My new Villa",
//         description: "by the beach",
//         price:  1200,
//         location: "Calangute, Goa",
//         country: "India",
//     });
// await sampleListing.save();
// console.log("Sample was Save ");
// res.send("Successful testing");
// });
// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "My New Villa",
//     description: "By the beach",
//     price: 1200,
//     location: "Calangute, Goa",
//     country: "India",
//   });

//   await sampleListing.save();
//   console.log("sample was saved");
//   res.send("successful testing");
// });

app.all("*", (req,res,next) => {
    next(new ExpressError(404, "Page not found"));
});



app.use((err, req,res, next) => {
   // res.send("Something went wrong");
   let {statusCode=500, message="something went wrong"}= err;
   //res.status(statusCode).send(message);
   res.status(statusCode).render("error.ejs", {message});
});



app.listen(8080, () => {
    console.log("server is listening to port 8080");
});
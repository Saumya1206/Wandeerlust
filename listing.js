// const express= require("express");
// const router = express.Router();
// const {listingSchema, reviewSchema} = require("../schema.js");
// const wrapAsync = require("../utils/wrapAsync.js");
// const ExpressError = require("../utils/ExpressError.js");
// const Listing = require("../models/listing.js");

// const validateListing = (req, res, next) => {
//     let {error } = listingSchema.validate(req.body);
//     //const newListing = new Listing(req.body.listing);
//     if (error){
//         let errormsg = error.details.map((el) => el.message).join(",");
//         throw new ExpressError(400, errormsg);
//     } else {
//         next();
//     }

// };


// //Index Route
// router.get("/listings", wrapAsync (async (req,res) => {
//     const allListing =await Listing.find({});
//    // res.render("/listings/index.ejs", {allListing});
//    res.render("listings/index", { allListing });
//     // .then(res => {
//     //     console.log(res);
//     // });
// }));

// //New Route
// router.get("/listings/new", wrapAsync (async(req,res)=> {
//     res.render("listings/new");
// }));

// //Show Route

// router.get("/listings/:id", wrapAsync (async(req,res) => {
//     let {id} = req.params;
//     const listing = await Listing.findById(id).populate("reviews");
//     res.render("listings/show", { listing});

// }));
//  //Create Route
// //  app.post("/listings",  async (req,res)=> {
// //    // let {title, description, image, price, location, country} = req.body;
// //    //let listing = req.body.listing;
// //    const newListing = new Listing(req.body.listing);
// //     await newListing.save();
// //    //console.log(listing);
// //    res.redirect("/listings");

// //  });
//  router.post("/listings", validateListing, wrapAsync(async (req, res) => {
//     const newListing = new Listing(req.body.listing);
//     await newListing.save();
//     res.redirect("/listings");
//   })
// );
// // app.post("/listings", 
// //     wrapAsync (async (req, res, next) => {
// //     // if(!req.body.listings){
// //     //     throw new ExpressError(400, "Send Valid data for listing");
// //     // };
// //     let result = listingSchema.validate(req.body);
// //     const newListing = new Listing(req.body.listing);
// //     if (result.error){
// //         throw new ExpressError(400, result.error);
// //     }
// //     // try {
// //         await newListing.save();
// //         res.redirect("/listings");
// //     // } catch (error) {
// //     //     // console.error(error.errors); // Log specific validation errors
// //     //     // res.status(400).send('Listing validation failed');
// //     //     next(err);
// //     // }
// // }));

// //Edit Route
// router.get("/listings/:id/edit",  wrapAsync (async (req,res) => {
//     let {id} = req.params;
//     const listing = await Listing.findById(id);
//     res.render("listings/edit", {listing});

// }));

// //Update Route
// router.put("/listings/:id",validateListing, wrapAsync (async (req,res) => {
//     let {id} = req.params;
//     await Listing.findByIdAndUpdate(id, {...req.body.listing});
//     // res.redirect("/listings");
//     res.redirect(`/listings/${id}`);

// }));

// //Delete Route
// router.delete("/listings/:id", wrapAsync (async(req,res) => {
//     let {id} = req.params;
//     let deletedListing =  await Listing.findByIdAndDelete(id);
//     console.log(deletedListing);
//     res.redirect("/listings");

// }));

// module.exports = router;

const express = require("express");
const router = express.Router();
const { listingSchema } = require("../schema.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const {isLoggedIn} = require("../middleware.js");
const { saveRedirectUrl } = require('../middleware.js');
const passport = require('passport');




const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const errorMessage = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errorMessage);
    } else {
        next();
    }
};

// Index Route
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
}));

// New Route
router.get("/new", isLoggedIn,(req, res) => {
    res.render("listings/new");
});

// Show Route
router.get("/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if(!listing){
        req.flash("error", " Listing you requested for does not exist");
        res.redirect("/listings")
    }
    res.render("listings/show", { listing });
}));

// Create Route
// router.post("/", validateListing, isLoggedIn, wrapAsync(async (req, res) => {
//     const newListing = new Listing(req.body.listing);
//     await newListing.save();
//     req.flash("success", "New Listing created");
//     res.redirect("/listings");
// }));
router.post("/login",
    saveRedirectUrl, 
    passport.authenticate("local", { failureRedirect: "/login", failureFlash : true}), async(req, res) => {
     req.flash("success", "Welcome to Wanderlust! You are logged In");
     const redirectUrl = res.locals.redirectUrl || "/listings";
     res.redirect(redirectUrl);
  });
  

// Edit Route
router.get("/:id/edit", isLoggedIn,wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit", { listing });
}));

// Update Route
router.put("/:id", validateListing, isLoggedIn, wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", " Listing updated");
    res.redirect(`/listings/${id}`);
}));

// Delete Route
router.delete("/:id", isLoggedIn,wrapAsync(async (req, res) => {
    const { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", " Listing Deleted");
    res.redirect("/listings");
}));

module.exports = router;

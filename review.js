const express = require("express");
const router = express.Router({ mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("../schema.js");
const Listing = require("../models/listing"); 
const Review = require("../models/review.js");



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

//POST  review ROUTE
router.post("/", validateReview,  wrapAsync(async(req,res) => {
    console.log(req.params.id);
    try{  let listing = await Listing.findById(req.params.id);
      let newReview = new Review(req.body.review);
  
      listing.reviews.push(newReview);
  
      await newReview.save();
      await listing.save();
  
      console.log("reviews saved");
     // res.send("new review saved");
     req.flash("success", "New Review created");
     res.redirect(`/listings/${listing._id}`);
  } catch (e) {
      console.error(e);
      res.redirect(`/listings/${req.params.id}`);
  }
  }));
  
  //delete review route
  router.delete("/:reviewId", wrapAsync(async(req,res) => {
      let {id, reviewId} = req.params;
      await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
      await Review.findByIdAndDelete(reviewId);
      req.flash("success", "Review deleted");
  
      res.redirect(`/listings/${id}`);
  }
  
  ));

  module.exports = router;

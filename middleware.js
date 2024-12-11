module.exports.isLoggedIn = (req, res, next) => {
    console.log(req.path, "..", req.originalUrl);
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "you must be logged in to create listing");
        return res.redirect("/login")
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;

    }
    next();
};
// module.exports.saveRedirectUrl = (req, res, next) => {
//     if (req.session.returnTo) {
//         res.locals.redirectUrl = req.session.returnTo;
//     } else {
//         res.locals.redirectUrl = "/listings"; // fallback URL
//     }
//     next();
// };
// module.exports.saveRedirectUrl = (req, res, next) => {
//     if (req.session.returnTo) {
//         res.locals.redirectUrl = req.session.returnTo;
//         delete req.session.returnTo;  // Clean up the session
//     } else {
//         res.locals.redirectUrl = "/listings";  // Default URL
//     }
//     next();
// };

// module.exports.saveRedirectUrl = (req, res, next) => {
//     if (req.session) {
//         req.session.redirectTo = req.originalUrl;
//     }
//     next();
// };


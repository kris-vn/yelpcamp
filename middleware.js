const Campground = require('./models/campground')
const Review = require('./models/review')
const ExpressError = require('./utils/ExpressError')
const { campgroundSchema, reviewSchema } = require('./schemas')



// Verifies if a user is logged in

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        // console.log(req.path, req.originalUrl)
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in to view this content!')
        return res.redirect('/login')
    }
    next()
}


//Stores the PATH which an unauthanticated user was trying to originally access

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo
    }
    next()
}


// Validates data for a new "campground"

module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

// Verifies campground author (owner) permissions

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!')
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

// Verifies review author permissions

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params
    const review = await Review.findById(reviewId)
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!')
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

// Validates data for a new "review"

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

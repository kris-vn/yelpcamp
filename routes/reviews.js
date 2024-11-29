const express = require('express')
const router = express.Router({ mergeParams: true }) // GIVES ACCESS TO req.params FOR USING CAMP ID
const reviews = require('../controllers/reviews')
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')
const catchAsync = require('../utils/catchAsync')



// "Reviews" routes

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))


module.exports = router
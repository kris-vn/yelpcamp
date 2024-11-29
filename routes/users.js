const express = require('express')
const router = express.Router()
const users = require('../controllers/users')
const User = require('../models/user')
const catchAsync = require('../utils/catchAsync')
const passport = require('passport')
const { storeReturnTo } = require('../middleware')


// Users Routes

router.route('/register')
    .get(users.renderRegisterForm)
    .post(catchAsync(users.register))


router.route('/login')
    .get(users.renderLoginForm)
    .post(storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)


router.get('/logout', users.logout)

module.exports = router

const User = require('../models/user')


// USERS CONTROLLER


module.exports.renderRegisterForm = (req, res) => {
    res.render('users/register')
}

module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body
        const user = new User({ email, username })
        const registeredUser = await User.register(user, password)
        req.login(registeredUser, err => {
            if (err) return next(err)
            req.flash('success', 'Welcome to Yelp Camp!')
            res.redirect('/campgrounds')
        })
    } catch (error) {
        req.flash('error', error.message)
        res.redirect('/register')
    }
}

module.exports.renderLoginForm = (req, res) => {
    res.render('users/login')
}

module.exports.login = (req, res) => {
    const { username } = req.user
    const redirectUrl = res.locals.returnTo || '/campgrounds'
    req.flash('success', `Welcome back, ${username}!`)
    delete req.session.returnTo
    res.redirect(redirectUrl)
}

module.exports.logout = (req, res) => {
    req.logout(function (err) {
        if (err) {
            return next(err)
        }
        req.flash('success', 'Goodbye!')
        res.redirect('/campgrounds')
    })
}
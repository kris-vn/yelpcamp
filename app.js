//MVC - Model View Controller pattern

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}


const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash')
const ExpressError = require('./utils/ExpressError')
const catchAsync = require('./utils/catchAsync')
const methodOverride = require('method-override')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const MongoStore = require('connect-mongo')


const campgroundRoutes = require('./routes/campgrounds.js')
const reviewRoutes = require('./routes/reviews.js')
const userRoutes = require('./routes/users.js')
const User = require('./models/user.js')

const app = express()
const db = mongoose.connection

// const dbUrl = process.env.DB_URL
const dbUrl = 'mongodb://localhost:27017/yelp-camp'
// 'mongodb://localhost:27017/yelp-camp'
mongoose.connect(dbUrl)

db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
    console.log('Database connected')
})


app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize())


// app.use(session({
//     secret: 'foo',
//     store: MongoStore.create(options)
//   }))

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thisshouldbeabettersecret'
    }
})

store.on('error', function (err) {
    console.log('SESSION STORE ERROR', err)
})

const sessionConfig = {
    store,
    name: 'session',
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,  //The cookie should only work over https (use for deployment)
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,  // Cookie will expire after 1 week
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash())
app.use(helmet())



const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com"
]
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.maptiler.com"
]
const connectSrcUrls = [
    "https://api.maptiler.com/"
]
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dvlxg5qjf/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
                "https://api.maptiler.com/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
)



app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


app.use((req, res, next) => {
    // console.log(req.session)
    // console.log(req.query)
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

app.get('/fakeUser', async (req, res) => {
    const user = new User({ email: 'colt@mail.com', username: 'colttt' })
    const newUser = await User.register(user, 'chicken')
    res.send(newUser)
})


app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)


app.get('/', catchAsync(async (req, res) => {
    res.render('home')
}))


app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    if (!err.message) err.message = 'Oh no, something went wrong!'
    res.status(statusCode).render('error', { err })
})


app.listen(3000, () => {
    console.log('Serving on port 3000')
})
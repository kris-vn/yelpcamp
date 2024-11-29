const mongoose = require('mongoose')
const Review = require('./review')
const Schema = mongoose.Schema


// https://res.cloudinary.com/dvlxg5qjf/image/upload/w_300/v1732520521/YelpCamp/vjmonj0ryeunsod7udvy.jpg

const ImageSchema = new Schema({
    url: String,
    filename: String
})

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/c_fill,h_200,w_200')
})

const options = { toJSON: { virtuals: true } }

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, options)

CampgroundSchema.virtual('properties.popupMarkup').get(function () {
    return `
        <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
        <p>${this.description.substring(0, 20)}...</p >
`
})


CampgroundSchema.post('findOneAndDelete', async function (deletedCamp) {
    if (deletedCamp) {
        await Review.deleteMany({ _id: { $in: deletedCamp.reviews } })
    }
})


const Campground = mongoose.model('Campground', CampgroundSchema)
module.exports = Campground



// image: `https://picsum.photos/400?random=${Math.random()}`
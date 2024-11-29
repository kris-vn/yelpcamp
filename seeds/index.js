const mongoose = require('mongoose')
const cities = require('./cities')
const { places, descriptors } = require('./seedHelpers')
const Campground = require('../models/campground')

mongoose.connect('mongodb://localhost:27017/yelp-camp')

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
    console.log('Database connected')
})

const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
    await Campground.deleteMany({})
    for (let i = 0; i < 10; i++) {
        const random1000 = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 20) + 10
        const camp = new Campground({
            // YOUR USER ID
            author: '67457dfba9ac26281939a922',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Laudantium facilis dolor ipsum, perspiciatis vel dolorum. Nostrum numquam quisquam iure qui animi officiis neque molestias aspernatur aperiam non, commodi voluptas velit.',
            price,
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dvlxg5qjf/image/upload/v1732520521/YelpCamp/vjmonj0ryeunsod7udvy.jpg',
                    filename: 'YelpCamp/dgvn6wpippuou05hks0g',
                },
                {
                    url: 'https://res.cloudinary.com/dvlxg5qjf/image/upload/v1732523939/YelpCamp/tcsmhr530hhyzdf7dra4.jpg',
                    filename: 'YelpCamp/qhh9l1lxzpvjhob2uuvi',
                }
            ]
        })
        await camp.save()
    }
}

seedDB().then(() => {
    mongoose.connection.close()
})
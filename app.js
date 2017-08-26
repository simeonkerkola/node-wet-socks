
'use strict'

const express = require('express')
const hbs = require('hbs')
const fs = require('fs')
const axios = require('axios')
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')

const time = require('./timeNow')

const key = fs.readFileSync('./access-key').toString().trim()
const cities = [
  'eg. Bundi India',
  'eg. Market Blvd, Sacramento, CA',
  'eg. Thamel Katmandu 44600',
  'eg. 1 Rue Charles Porta, 76600 Le Havre, France',
  'eg. Chigasaki Kanagawa 253-0061',
  'eg. Chang Wat Chiang Mai',
  'eg. Praia de Belas, Porto Alegre - RS, Brazil',
  'eg. Geylang East Ave 3, Singapore 389731',
  'eg. Chicalim, Vasco, South Goa, Goa 403711, India',
]

const port = process.env.PORT || 3000 // const heroku or vultr to configure port
const app = express()

app.set('view engine', 'hbs') // set the view engine for express
app.use(express.static(`${__dirname}/public`)) // folder for static pages
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(expressValidator())

hbs.registerHelper('getCurrentYear', () => new Date().getFullYear())
hbs.registerHelper('homepage', () => 'http://smi.fyi')
hbs.registerHelper('wetSocksGithub', () => 'https://github.com/sssmi/wet-socks')

app.use((req, res, next) => {
  const now = new Date().toString()
  const log = `${now}: ${req.method} ${req.url}`

  console.log(log)
  next()
})

app.get('/', (req, res) => {
  res.render('index.hbs', {
    pageTitle: 'Wet Socks',
    placeholder: cities[Math.floor(Math.random() * 9)],
    onHourly: true,
  })
})

app.get('/weather', (req, res) => {
  // // Check that the field is not empty
  // req.checkBody('address', 'Address is required').notEmpty()
  //
  // // trim and escape the address field
  // // req.sanitize('address').escape()
  // // req.sanitize('address').trim()
  //
  // // run the validators
  // const errors = req.getValidationResult()

  const addressInput = req.query.address

  const encodedAddress = encodeURIComponent(addressInput)
  const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}`

  const array = []
  // http get request
  axios.get(geocodeUrl).then((response) => {
    if (response.data.status === 'ZERO_RESULTS') throw new Error('Unable to find that address')

    const fullAddress = response.data.results[0].formatted_address
    const lat = response.data.results[0].geometry.location.lat
    const lng = response.data.results[0].geometry.location.lng
    const weatherUrl = `https://api.darksky.net/forecast/${key}/${lat},${lng}`

    array.push(fullAddress)

    // nodemon --inspect-brk app.js
    // opera://inspect/

    return axios.get(weatherUrl)
  }).then((response) => {
    console.log('Got the address')

    const current = response.data.currently
    const celsius = temp => ((temp - 32) / 1.8).toFixed(1)

    const address = array[0]
    const currentTime = current.time
    const timeOffset = response.data.offset

    const localTime = time.timeNow(currentTime, timeOffset)

    const summary = response.data.hourly.summary
    const temperature = celsius(current.temperature)
    const apparentTemperature = celsius(current.apparentTemperature)
    const precipProbability = (current.precipProbability * 100).toFixed(0)
    const humidity = (current.humidity * 100).toFixed(0)
    const cloudCover = (current.cloudCover * 100).toFixed(0)
    const pressure = current.pressure.toFixed(2)

    const hourlyWeather = response.data.hourly.data
      .splice(0, 17) // get the first 18 hours only
      .map(hourly => ({
        timeByHour: time.timeNow(hourly.time, timeOffset),
        summary: hourly.summary,
        temp: celsius(hourly.temperature),
        precipProbability: (hourly.precipProbability * 100).toFixed(0),
        cloudCover: (hourly.cloudCover * 100).toFixed(0),
      }))

    res.render('index.hbs', {
      address,
      localTime,
      summary,
      temperature,
      apparentTemperature,
      precipProbability,
      humidity,
      cloudCover,
      pressure,
      hourlyWeather,
      pageTitle: 'Wet Socks',
      placeholder: cities[Math.floor((Math.random() * 9) + 1)],
      showWeather: true,
    })
  }).catch((e) => {
    let errorMessage = e.message
    if (e.code === 'ENOTFOUND') {
      errorMessage = ('Unable to connect to API servers.')
    } else {
      errorMessage = e.message
    }
    console.log(errorMessage);
    res.render('index.hbs', { errorMessage: 'Unable to get the weather' })
  })
})

app.listen(port, () => {
  console.log('Server is up on port:', port)
})

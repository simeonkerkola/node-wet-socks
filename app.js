
'use strict'

const express = require('express')
const hbs = require('hbs')
const fs = require('fs')
const axios = require('axios')
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')
const moment = require('moment')

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
hbs.registerHelper('homepage', () => 'http://simeon.fyi')
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
    showHourly: true,
  })
})

app.get('/weather', async (req, res) => {
  // // Check that the field is not empty
  // req.checkBody('address', 'Address is required').notEmpty()
  //
  // // trim and escape the address field
  // // req.sanitize('address').escape()
  // // req.sanitize('address').trim()
  //
  // // run the validators
  // const errors = req.getValidationResult()

  try {
    const addressInput = req.query.address

    const encodedAddress = encodeURIComponent(addressInput)
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}`

    // http get request
    const geocode = await axios.get(geocodeUrl)

    if (geocode.data.status === 'ZERO_RESULTS') throw new Error('Unable to find that address')

    const address = geocode.data.results[0].formatted_address
    const lat = geocode.data.results[0].geometry.location.lat
    const lng = geocode.data.results[0].geometry.location.lng
    const weatherUrl = `https://api.darksky.net/forecast/${key}/${lat},${lng}?units=si`

    const weather = await axios.get(weatherUrl)

    // const celsius = temp => ((temp - 32) / 1.8).toFixed(1)
    const getIcon = (iconName) => {
      if (iconName === 'clear-night') return 'night-clear'
      else if (iconName === 'rain') return 'rain'
      else if (iconName === 'snow') return 'snow'
      else if (iconName === 'sleet') return 'sleet'
      else if (iconName === 'wind') return 'strong-wind'
      else if (iconName === 'fog') return 'fog'
      else if (iconName === 'cloudy') return 'cloudy'
      else if (iconName === 'partly-cloudy-day') return 'day-cloudy'
      else if (iconName === 'partly-cloudy-night') return 'night-alt-cloudy'
      return 'day-sunny'
    }
    const current = weather.data.currently
    const timeOffset = weather.data.offset * 3600
    const currentTime = current.time + timeOffset
    const hourlyWeather = weather.data.hourly.data
      .splice(1, 25) // from next hour to 24h onwards
      .map(hourly => ({
        timeByHour: moment.utc((hourly.time + timeOffset) * 1000).format('ddd H:mm'),
        icon: getIcon(hourly.icon),
        summary: hourly.summary,
        temp: hourly.temperature,
        precipProbability: (hourly.precipProbability * 100).toFixed(0),
        cloudCover: (hourly.cloudCover * 100).toFixed(0),
        wind: (hourly.windSpeed).toFixed(1),
      }))

    res.render('index.hbs', {
      address,
      localTime: moment.utc(currentTime * 1000).format('dddd Do MMM, H:mm'),
      summary: weather.data.hourly.summary,
      temperature: (current.temperature).toFixed(1),
      currentIcon: getIcon(current.icon),
      apparentTemperature: (current.apparentTemperature).toFixed(1),
      precipProbability: (current.precipProbability * 100).toFixed(0),
      humidity: (current.humidity * 100).toFixed(0),
      cloudCover: (current.cloudCover * 100).toFixed(0),
      windSpeed: current.windSpeed,
      windGust: current.windGust,
      pressure: current.pressure.toFixed(2),
      uvIndex: current.uvIndex,
      visibility: current.visibility,
      hourlyWeather,
      pageTitle: 'Wet Socks',
      placeholder: cities[Math.floor((Math.random() * 9) + 1)],
      showWeather: true,
    })
  } catch (e) {
    let errorMessage = e.message
    if (e.code === 'ENOTFOUND') {
      errorMessage = ('Unable to connect to API servers.')
    } else {
      errorMessage = e.message
    }
    res.render('index.hbs', { errorMessage })
  }
})

app.listen(port, () => {
  console.log('Server is up on port:', port)
})

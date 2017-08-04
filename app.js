// WEATHER APP
"use strict"
const express = require('express')
const hbs = require('hbs')
const fs = require('fs')
const axios = require('axios')
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')
const time = require('./time')

const key = fs.readFileSync('./access-key.txt').toString();

const port = process.env.PORT || 3000 // let heroku or vultr to configure port
let app = express()

app.set('view engine', 'hbs') // set the view engine for express
app.use(express.static(__dirname + '/public')) // folder for static pages
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(expressValidator())


app.use((req, res, next) => {
  let now = new Date().toString()
  let log = `${now}: ${req.method} ${req.url}`

  console.log(log)
  fs.appendFile('server.log', log + 'n', (err) => {
    if (err) console.log('Unable to append server.log')
  })
  next()
})

app.get('/', (req, res) => {
  // // Check that the field is not empty
  // req.checkBody('address', 'Address is required').notEmpty()
  //
  // // trim and escape the address field
  // // req.sanitize('address').escape()
  // // req.sanitize('address').trim()
  //
  // // run the validators
  // let errors = req.getValidationResult()

  const addressInput = req.query.address

  let encodedAddress = encodeURIComponent(addressInput)
  let geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}`

  let array = []
  // http get request
  axios.get(geocodeUrl).then((response) => {
    if (response.data.status ==='ZERO_RESULTS') throw new Error('Unable to find that address')

    let fullAddress = response.data.results[0].formatted_address
    let lat = response.data.results[0].geometry.location.lat
    let lng = response.data.results[0].geometry.location.lng
    let weatherUrl = `https://api.darksky.net/forecast/${key}/${lat},${lng}`

    array.push(fullAddress)

    // nodemon --inspect-brk app.js
    // opera://inspect/
    debugger;

    return axios.get(weatherUrl)

  }).then((response) => {
    console.log('Got the address')

    let weather = response.data
    let celsius = (temp) => ((temp - 32) / 1.8).toFixed(1)

    let address = array[0]
    let currentTime = weather.currently.time
    let timeOffset = weather.offset
    let localTime = time.timeNow(currentTime, timeOffset)
    console.log(localTime)

    let summary = weather.hourly.summary
    let temperature = celsius(weather.currently.temperature)
    let apparentTemperature = celsius(weather.currently.apparentTemperature)
    let precipProbability = (weather.currently.precipProbability * 100).toFixed(0)
    let humidity = (weather.currently.humidity * 100).toFixed(0)
    let cloudCover = (weather.currently.cloudCover * 100).toFixed(0)
    let pressure = weather.currently.pressure.toFixed(2)

    let hourlyData = weather.hourly.data
    let hourlyWeather = hourlyData.map((data) => {
      return {
        timeByHour: time.timeNow(data.time, timeOffset),
        summary: data.summary,
        temp: celsius(data.temperature),
        precipProbability: (data.precipProbability * 100).toFixed(0),
        cloudCover: (data.cloudCover * 100).toFixed(0)
      }
    })

    let placeholder = [
      'eg. Bundi India',
      'eg. Medan Sumatra',
      'eg. Thamel Katmandu 44600',
      'eg. Vientiane',
      'eg. Chigasaki Kanagawa 253-0061',
      'eg. Chang Wat Chiang Mai',
    ]

    // nodemon --inspect-brk app.js
    debugger;

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
      placeholder: placeholder[Math.floor((Math.random() * 7) + 1)],
      showWeekly: true
    })

  }).catch((e) => {
    let errorMessage = e.message
    if (e.code === 'ENOTFOUND') {
        errorMessage = ('Unable to connect to API servers.')
     } else {
      errorMessage = e.message
    }
    debugger
    console.log(errorMessage)
    res.render('index.hbs', {errorMessage})
  })
})

app.listen(port, () => {
  console.log('Server is up on port:', port)
})
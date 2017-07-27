// WEATHER APP
const express = require('express')
const hbs = require('hbs')
const fs = require('fs')
const axios = require('axios')

const key = fs.readFileSync('./access-key.txt').toString();

const port = process.env.PORT || 3000 // let heroku or vultr to configure port
var app = express()

app.use((req, res, next) => {
  var now = new Date().toString()
  var log = `${now}: ${req.method} ${req.url}`

  console.log(log)
  fs.appendFile('server.log', log + 'n', (err) => {
    if (err) console.log('Unable to append server.log')
  })
  next()
})

hbs.registerHelper('getWather', () => {

})

app.get('/', (req, res) => {
  // res.render('index.hbs', {
  //   pageTitle: 'Weather App',
  //   message:
  // })

  var encodedAddress = encodeURIComponent('Helsinki')
  var geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}`

  // http get request
  axios.get(geocodeUrl).then((response) => {
    if (response.data.status ==='ZERO_RESULTS') throw new Error('Unable to find that address')

    var addressData = []

    var fullAddress = response.data.results[0].formatted_address
    var lat = response.data.results[0].geometry.location.lat
    var lng = response.data.results[0].geometry.location.lng
    var weatherUrl = `https://api.darksky.net/forecast/${key}/${lat},${lng}`

    console.log('Got the address')
    return axios.get(weatherUrl)


  }).then((response) => {
    var weather = response.data
    var celsius = (temp) => ((temp - 32) / 1.8).toFixed(1)

    var date = new Date(weather.currently.time * 1000)
    var summary = weather.hourly.summary
    var temperature = celsius(weather.currently.temperature)
    var apparentTemperature = celsius(weather.currently.apparentTemperature)
    var precipProbability = (weather.currently.precipProbability * 100).toFixed(0)
    var humidity = (weather.currently.humidity * 100).toFixed(0)
    var cloudCover = (weather.currently.cloudCover * 100).toFixed(0)
    var pressure = weather.currently.pressure.toFixed(2)

    // weather.hourly.data.forEach((hourly) => {
    //
    //   var hourlyTime = new Date(hourly.time * 1000)
    //   res.write(`--- ${hourlyTime.getDate()}th At:  ${hourlyTime.getHours()} o'clock --- \n cloud coverage is about: ${(hourly.cloudCover * 100).toFixed(0)}% \n` +
    //               `Temperature: ${celsius(hourly.temperature)}\n`)
    // })
    res.render('index.hbs', {
      // fullAddress,
      // lat,
      // lng,
      date,
      summary,
      temperature,
      apparentTemperature,
      precipProbability,
      humidity,
      cloudCover,
      pressure
    })

  }).catch((error) => {
    if (error.response.status == 403) {
      errorMessage = ('Darksky API access forbidden.\n' +
                  'Did you register at https://darksky.net/dev/ ' +
                  'and copied the key you got to a access-key.txt file?')
    } else if (error.code === 'ENOTFOUND') {
        errorMessage = ('Unable to connect to API servers.')
    } else {
      errorMessage = error.message
    }
  })
})

app.listen(port, () => {
  console.log('Server is up on port:', port)
})
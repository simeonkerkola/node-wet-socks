'use strict'

const express = require('express')
const hbs = require('hbs')
const fs = require('fs')
const axios = require('axios')
const { renderWeather } = require('./src/renderWeather.js')

const key = fs.readFileSync('./access-key').toString().trim()

const port = process.env.PORT || 3000
const app = express()

app.set('view engine', 'hbs') // set the view engine for express
app.use(express.static(`${__dirname}/public`)) // folder for static pages

hbs.registerHelper('getCurrentYear', () => new Date().getFullYear())
hbs.registerHelper('homepage', () => 'http://simeon.fyi')
hbs.registerHelper('wetSocksGithub', () => 'https://github.com/sssmi/node-wet-socks')

app.use((req, res, next) => {
  const now = new Date().toString()
  const log = `${now}: ${req.method} ${req.url}`

  console.log(log)
  next()
})

app.get('/', async (req, res) => {
  let addressInput = req.query.address
  try {
    if (!addressInput) addressInput = 'Helsinki'
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

    res.render('index.hbs', renderWeather(weather, address))
  } catch (e) {
    let errorMessage = e.message
    if (e.code === 'ENOTFOUND') {
      errorMessage = ('Unable to connect to API servers.')
      res.render('index.hbs', { errorMessage })
    } else {
      errorMessage = e.message
    }
    errorMessage = "Couldn't get any weather data :("
    res.render('index.hbs', { errorMessage })
    console.log(e.message);
  }
})

app.listen(port, () => {
  console.log('Server is up on port:', port)
})

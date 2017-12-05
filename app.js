'use strict'

const express = require('express')
const hbs = require('hbs')
const fs = require('fs')
const axios = require('axios')
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

hbs.registerHelper('getCurrentYear', () => new Date().getFullYear())
hbs.registerHelper('homepage', () => 'http://simeon.fyi')
hbs.registerHelper('wetSocksGithub', () => 'https://github.com/sssmi/node-wet-socks')

app.use((req, res, next) => {
  const now = new Date().toString()
  const log = `${now}: ${req.method} ${req.url}`

  console.log(log)
  next()
})

const renderWeather = (weather, address) => {
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
    else if (iconName === 'hail') return 'hail'
    else if (iconName === 'thunderstorm') return 'thunderstorm'
    else if (iconName === 'tornado') return 'tornado'
    return 'day-sunny'
  }

  const { offset } = weather.data
  const {
    temperature,
    icon,
    apparentTemperature,
    precipProbability,
    humidity,
    cloudCover,
    windSpeed,
    windGust,
    pressure,
    uvIndex,
    visibility,
    time,
  } = weather.data.currently

  const hourlyWeather = weather.data.hourly.data
    .splice(1, 25) // from next hour to 24h onwards
    .map(hourly => ({
      timeByHour: moment.utc((hourly.time + (offset * 3600)) * 1000).format('ddd H:mm'),
      icon: getIcon(hourly.icon),
      summary: hourly.summary,
      temp: (hourly.temperature).toFixed(0),
      precipProbability: (hourly.precipProbability * 100).toFixed(0),
      cloudCover: (hourly.cloudCover * 100).toFixed(0),
      wind: (hourly.windSpeed).toFixed(1),
    }))

  const renderData = {
    showWeather: true,
    pageTitle: 'Wet Socks',
    placeholder: cities[Math.floor(Math.random() * 9)],
    showHourly: true,
    address,
    localTime: moment.utc((time + (offset * 3600)) * 1000).format('dddd Do MMM, H:mm'),
    summary: weather.data.hourly.summary,
    temperature: temperature.toFixed(1),
    currentIcon: getIcon(icon),
    apparentTemperature: apparentTemperature.toFixed(1),
    precipProbability: (precipProbability * 100).toFixed(0),
    humidity: (humidity * 100).toFixed(0),
    cloudCover: (cloudCover * 100).toFixed(0),
    pressure: pressure.toFixed(2),
    windSpeed,
    windGust,
    uvIndex,
    visibility,
    hourlyWeather,
  }
  return renderData
}

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

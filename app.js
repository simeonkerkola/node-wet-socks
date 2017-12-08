const express = require('express')
const hbs = require('hbs')
const { renderWeather } = require('./src/renderWeather.js')
const { getWeather } = require('./src/getWeather.js')

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

app.get('/', (req, res) => {
  const addressInput = req.query.address || 'helsinki'
  getWeather(addressInput).then((result) => {
    res.render('index.hbs', renderWeather(result))
  })
})

app.listen(port, () => {
  console.log('Server is up on port:', port)
})

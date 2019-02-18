const express = require('express')
const bodyParser = require('body-parser')
const hbs = require('hbs')
const expressip = require('express-ip');
const { renderWeather } = require('./src/renderWeather.js')
const { getWeather } = require('./src/getWeather.js')

const port = process.env.PORT || 3000
const app = express()

app.use(expressip().getIpInfoMiddleware);
app.set('view engine', 'hbs') // set the view engine for express
app.use(express.static(`${__dirname}/public`)) // folder for static pages
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

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
  res.render('index.hbs')
  console.log(req)
})

app.get(
  '/weather/:address',
  (req, res) =>
    getWeather(req.params.address)
      .then((result) => {
        const data = {}
        data.weather = result.weather.data
        data.address = result.address
        console.log('data', data)
        console.log('ip', req.ip)
        return data
      })
      .then((data) => {
        const renderedWeather = renderWeather(data)
        return res.status(200).send(renderedWeather)
      })
      .catch((err) => {
        res.send({ error: "Couldn't get the weather" })
        console.log(err)
      }),
  // getWeather(addressInput).then((result) => {
  //   res.render('index.hbs', renderWeather(result))
  //   console.log('ip', req.ip)
  //   console.log('body', addressInput)
  //   const weatherData = renderWeather(result)
  // })
)

app.listen(port, () => {
  console.log('Server is up on port:', port)
})

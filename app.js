const express = require('express');
const bodyParser = require('body-parser');
const hbs = require('hbs');
const expressip = require('express-ip');
const { renderWeather } = require('./src/renderWeather.js');
const { processAddress, getWeather } = require('./src/weather.js');

const port = process.env.PORT || 3000;
const app = express();

app.use(expressip().getIpInfoMiddleware);
app.set('view engine', 'hbs'); // set the view engine for express
app.use(express.static(`${__dirname}/public`)); // folder for static pages
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

hbs.registerHelper('getCurrentYear', () => new Date().getFullYear());
hbs.registerHelper('homepage', () => 'http://simeon.fyi');
hbs.registerHelper('wetSocksGithub', () => 'https://github.com/sssmi/node-wet-socks');

app.use((req, res, next) => {
  const now = new Date().toString();
  const log = `${now}: ${req.method} ${req.url}`;
  console.log(log);
  next();
});

app.get('/', async (req, res) => {
  res.render('index.hbs');
});

app.get('/weather', async (req, res) => {
  const { city, ll, error } = req.ipInfo;
  if (error) return res.status(404).send({ message: 'Could not get initial data :(', code: 404 });
  try {
    const data = {};
    let result;
    if (city && ll) {
      result = await getWeather(city, ll[0], ll[1]);
      data.weather = result.weather.data;
      data.address = result.address;
    } else if (city) {
      result = await processAddress(city);
    }
    data.weather = result.weather.data;
    data.address = result.address;

    const renderedWeather = renderWeather(data);
    return res.status(200).send(renderedWeather);
  } catch (e) {
    console.error(e.message);
  }

  console.log(req.ipInfo);
});

app.get(
  '/weather/:address',
  (req, res) =>
    processAddress(req.params.address)
      .then((result) => {
        const data = {};
        data.weather = result.weather.data;
        data.address = result.address;
        // console.log('data', data)
        // console.log('ip', req.ip)
        return data;
      })
      .then((data) => {
        const renderedWeather = renderWeather(data);
        return res.status(200).send(renderedWeather);
      })
      .catch((err) => {
        res.send({ error: "Couldn't get the weather" });
        console.log(err);
      }),
  // processAddress(addressInput).then((result) => {
  //   res.render('index.hbs', renderWeather(result))
  //   console.log('ip', req.ip)
  //   console.log('body', addressInput)
  //   const weatherData = renderWeather(result)
  // })
);

app.listen(port, () => {
  console.log('Server is up on port:', port);
});

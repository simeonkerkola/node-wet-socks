const axios = require('axios')
require('dotenv').config()

// Change to env var
const DARKSKY_KEY = process.env.DARKSKY_KEY
const GOOGLE_KEY = process.env.GOOGLE_KEY

exports.getWeather = async (addressInput) => {
  try {
    const encodedAddress = encodeURIComponent(addressInput)
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GOOGLE_KEY}`

    // http get request
    const geocode = await axios.get(geocodeUrl)

    if (geocode.data.status === 'ZERO_RESULTS') {
      throw new Error('Unable to find that address')
    } else if (geocode.data.status === 'OVER_QUERY_LIMIT') {
      throw new Error("Whoops! Looks like I've exceeded request quota for Google Maps API")
    } else if (geocode.data.status !== 'OK') {
      throw new Error('Sorry! Some kind of error with Google Maps API')
    }

    const address = geocode.data.results[0].formatted_address
    const lat = geocode.data.results[0].geometry.location.lat
    const lng = geocode.data.results[0].geometry.location.lng
    const weatherUrl = `https://api.darksky.net/forecast/${DARKSKY_KEY}/${lat},${lng}?units=si`

    const weather = await axios.get(weatherUrl)

    return {
      weather,
      address,
    }
  } catch (e) {
    let errorMessage = e.message
    if (e.code === 'ENOTFOUND') {
      errorMessage = 'Unable to connect to API servers.'
    } else {
      errorMessage = e.message
    }
    errorMessage = "Couldn't get any weather data :("
    console.log(e.message)
  }
}

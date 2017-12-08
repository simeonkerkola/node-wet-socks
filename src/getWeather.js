const axios = require('axios')
const fs = require('fs')

const key = fs
  .readFileSync('./access-key')
  .toString()
  .trim()

exports.getWeather = async (addressInput) => {
  try {
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

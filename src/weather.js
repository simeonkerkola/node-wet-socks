const axios = require('axios');
require('dotenv').config();

// Change to env var
const DARKSKY_KEY = process.env.DARKSKY_KEY;
const GOOGLE_KEY = process.env.GOOGLE_KEY;

exports.processAddress = async (addressInput) => {
  // return await this.getWeather();

  try {
    const encodedAddress = encodeURIComponent(addressInput);
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GOOGLE_KEY}`;

    // http get request
    const geocode = await axios.get(geocodeUrl);

    if (geocode.data.status === 'ZERO_RESULTS') {
      throw new Error('Unable to find that address');
    } else if (geocode.data.status === 'OVER_QUERY_LIMIT') {
      throw new Error("Whoops! Looks like I've exceeded request quota for Google Maps API");
    } else if (geocode.data.status !== 'OK') {
      throw new Error('Sorry! Some kind of error with Google Maps API');
    }

    const address = geocode.data.results[0].formatted_address;
    const lat = geocode.data.results[0].geometry.location.lat;
    const lng = geocode.data.results[0].geometry.location.lng;

    return await this.getWeather(address, lat, lng);
  } catch (e) {
    let errorMessage = e.message;
    if (e.code === 'ENOTFOUND') {
      errorMessage = 'Unable to connect to API servers.';
    } else {
      errorMessage = e.message;
    }
    console.error(errorMessage);
  }
};

exports.getWeather = async (address, lat, lng) => {
  const weatherUrl = `https://api.darksky.net/forecast/${DARKSKY_KEY}/${lat},${lng}?units=si`;
  // const weatherUrl = `https://api.darksky.net/forecast/5b05469397c05086e48a473a3c2bda80/37.8267,-122.4233?units=si`;

  try {
    const weather = await axios.get(weatherUrl);
    // console.log('WEATHER!!', weather);
    return {
      weather,
      address,
    };
  } catch (e) {
    console.error(e.message);
  }
};

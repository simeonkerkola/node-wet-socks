const moment = require('moment')

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

exports.renderWeather = (weather, address) => {
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

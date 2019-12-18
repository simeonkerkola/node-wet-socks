const moment = require('moment');

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
];

exports.renderWeather = ({ weather, address }) => {
  // const celsius = temp => ((temp - 32) / 1.8).toFixed(1)
  const getIcon = (iconName) => {
    if (iconName === 'clear-night') return 'Moon.svg';
    else if (iconName === 'rain') return 'Cloud-Drizzle-Alt.svg';
    else if (iconName === 'snow') return 'Cloud-Snow-Alt.svg';
    else if (iconName === 'sleet') return 'Cloud-Hail-Alt.svg';
    else if (iconName === 'wind') return 'Wind.svg';
    else if (iconName === 'fog') return 'Cloud-Fog.svg';
    else if (iconName === 'cloudy') return 'Cloud.svg';
    else if (iconName === 'partly-cloudy-day') return 'Cloud-Sun.svg';
    else if (iconName === 'partly-cloudy-night') return 'Cloud-Moon.svg';
    else if (iconName === 'hail') return 'Cloud-Hail-Alt.svg';
    else if (iconName === 'thunderstorm') return 'Cloud-Lightning.svg';
    else if (iconName === 'tornado') return 'Tornado.svg';
    return 'Sun.svg';
  };

  const { offset } = weather;
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
    precipIntensity
  } = weather.currently;

  const hourlyWeather = weather.hourly.data
    .splice(1, 49) // from next hour to 24h onwards
    .map(hourly => ({
      timeByHour: moment.utc((hourly.time + offset * 3600) * 1000).format('ddd H:mm'),
      icon: getIcon(hourly.icon),
      summary: hourly.summary,
      temp: hourly.temperature.toFixed(0),
      precipProbability: (hourly.precipProbability * 100).toFixed(0),
      cloudCover: (hourly.cloudCover * 100).toFixed(0),
      wind: hourly.windSpeed.toFixed(1),
      precipIntensity: hourly.precipIntensity.toFixed(1),
    }));

  const renderData = {
    showWeather: true,
    pageTitle: 'Wet Socks',
    placeholder: cities[Math.floor(Math.random() * 9)],
    showHourly: true,
    address,
    localTime: moment.utc((time + offset * 3600) * 1000).format('dddd Do MMM, H:mm'),
    summary: weather.hourly.summary,
    bigNumber: temperature.toFixed(1),
    currentIcon: getIcon(icon),
    apparentTemperature: apparentTemperature.toFixed(1),
    precipProbability: (precipProbability * 100).toFixed(0),
    humidity: (humidity * 100).toFixed(0),
    cloudCover: (cloudCover * 100).toFixed(0),
    pressure: pressure.toFixed(2),
    precipIntensity:precipIntensity.toFixed(1),
    windSpeed,
    windGust,
    uvIndex,
    visibility,
    hourlyWeather,
  };
  return renderData;
};

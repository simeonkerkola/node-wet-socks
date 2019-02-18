/* eslint no-restricted-syntax:0, prefer-template: 0, prefer-arrow-callback: 0, func-names: 0, no-var: 0, vars-on-top: 0 */
/* global $ */

// Elements
var errorMessage = document.querySelector('.errorMessage')
var weatherContainer = document.querySelector('.weatherContainer')
var weatherHourly = document.querySelector('.weatherHourly')
var loadingSpinner = document.querySelector('.loadingSpinner')
var submitBtn = document.querySelector('#submitBtn')

submitBtn.addEventListener('click', formSubmit)

// Render Functions
function renderHourly(hourly) {
  weatherHourly.innerHTML = '' // remove old hourly data before rendering

  for (var i = 0; i < hourly.length; i++) {
    weatherHourly.insertAdjacentHTML(
      'beforeend',
      '<div class="row">' +
      '<div class="col-xs-2 weather-col hourly-time">' +
      hourly[i].timeByHour +
      '</div>' +
      '<div class="col-xs-1 weather-col first-row hourly-svg__col"><img class="hourly-svg" src="/img/svg/' +
      hourly[i].icon +
      '" alt="' +
      hourly[i].icon +
      '"' +
      '"/></div>' +
      '<div class="col-xs-3 weather-col hourly-summary">' +
      hourly[i].summary +
      '</div>' +
      '<div class="col-xs-2 weather-col">' +
      hourly[i].temp +
      '°C</div>' +
      '<div class="col-xs-1 weather-col">' +
      hourly[i].precipProbability +
      '%</div>' +
      '<div class="col-xs-1 weather-col">' +
      hourly[i].cloudCover +
      '%</div>' +
      '<div class="col-xs-1 weather-col">' +
      hourly[i].wind +
      'm/s</div>' +
      '</div>',
    )
  }
}

function renderWeather(data) {
  weatherContainer.classList.add('show-me')
  weatherContainer.classList.remove('hide-me')
  var currentIcon = document.querySelector('.currentIcon')
  for (prop in data) {
    if (data.hasOwnProperty(prop)) {
      var tagName = document.querySelector('.' + prop)
      if (tagName) {
        tagName.innerHTML = data[prop]
        if (tagName === currentIcon) {
          tagName.setAttribute('src', '/img/svg/' + data[prop])
          tagName.setAttribute('alt', data.hourlyWeather[0].summary)
        }
      }
    }
  }
}

function formSubmit(e) {
  e.preventDefault()

  var addressInput = document.querySelector('.addressInput').value
  loadingSpinner.classList.toggle('show-me')

  errorMessage.classList.remove('show-me')
  errorMessage.classList.add('hide-me')

  weatherContainer.classList.add('hide-me')
  weatherContainer.classList.remove('show-me')
  axios
    .get(`/weather/${addressInput}`)
    .then(function (response) {
      loadingSpinner.classList.toggle('show-me')
      if (!response.data.error) {
        renderWeather(response.data)
        renderHourly(response.data.hourlyWeather)
      } else if (response.data.error) {
        errorMessage.classList.add('show-me')
        errorMessage.classList.remove('hide-me')
        errorMessage.innerHTML = response.data.error
      } else {
        errorMessage.classList.add('show-me')
        errorMessage.classList.remove('hide-me')
      }
    })
    .catch(function (error) {
      loadingSpinner.classList.toggle('show-me')
      errorMessage.classList.add('show-me')
      errorMessage.classList.remove('hide-me')
      errorMessage.innerHTML = 'Are you sure that is a valid address?'
      console.log(error)
    })
}

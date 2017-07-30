var timeNow = (timestamp) => {
  var time = new Date(timestamp)
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  var month = months[time.getUTCMonth()]
  var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  var day = days[time.getUTCDay()]
  var date = time.getUTCDate()
  var hours = time.getUTCHours()
  var minutes = '0' + time.getUTCMinutes()
  var localTime = day + ' ' + month + ' ' + date + ' ' + hours + ':' + minutes.substr(-2)
  return localTime
}

module.exports.timeNow = timeNow
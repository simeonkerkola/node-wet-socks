const timeNow = (stamp, offset = 0) => {
  // if time < 1000
  const offsetToHours = offset * 3600
  const timestamp = stamp + offsetToHours
  const time = new Date(timestamp * 1000)
  const year = time.getFullYear()
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const month = months[time.getUTCMonth()]
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const day = days[time.getUTCDay()]
  const date = time.getUTCDate()
  const hours = (`0${time.getUTCHours()}`).substr(-2)
  const minutes = (`0${time.getUTCMinutes()}`).substr(-2)
  const seconds = (`0${time.getUTCSeconds()}`).substr(-2)
  const localTime = {
    timestamp,
    year,
    month,
    day,
    date,
    hours,
    minutes,
    seconds,
  }
  return localTime
}

module.exports.timeNow = timeNow

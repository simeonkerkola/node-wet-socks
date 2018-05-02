# Web-weather

### Global weather search app

**Live demo here: https://wet-socks.herokuapp.com/**

A Nodejs based web application that interacts with Google Maps and Dark Sky

**What it does, and what it should be able to do:**

* [x] Get weather by address
* [x] Reject bad addresses
* [ ] Get the weather using geolocation

### Install

* Clone repo `$ git clone https://github.com/sssmi/node-weather-app.git`
* Install the dependencies `$ npm install`
* To access a Dark Sky API, Create a new account at https://darksky.net/dev/
* `$ cd` to project folder and `$ echo "DARKSKY_KEY=your-key-here" >> .env`
  **OR**
* Create a `.env` file in the project's folder and paste the key you got: `DARKSKY_KEY=your-key-here`

### Fire up

* `$ nodemon app.js`
* Then open `http://localhost:3000` in your browser

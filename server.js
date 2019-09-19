'use strict';

/**
 * Dependencies
 */

const express = require('express');
const cors = require('cors');
const app = express();
const superagent = require('superagent');
require('dotenv').config();

app.use(cors());

/**
 * Routes
 */

app.get('/location', getLocation);
app.get('/weather', getWeather);
app.get('/events', getEvents);
app.use('*', wildcardRouter);

/**
 * Routers
 */

/**
 * Router for retrieving location data Google
 * @param {Object} request - Comes from the cliet
 * @param {Object} response - Goes back to the cliet
 */
function getLocation(request, response) {
  let queryStr = request.query.data;
  let url = `https://maps.googleapis.com/maps/api/geocode/json?address=${queryStr}&key=${process.env.GOOGLE_API_KEY}`;

  superagent.get(url)
    .then(saResult => {
      const body = saResult.body;
      const location = new Location(queryStr, body);
      response.status(200).send(location);
    })
    .catch(err => {
      const error = new Error(err);
      console.error(err);
      response.status(error.status).send(error.responseText);
    });
}

/**
 * Router for retrieving weather data Darksky API
 * @param {Object} request - Comes from the client
 * @param {Object} response - Goes back to the client
 */
function getWeather(request, response) {
  const searchQuery = request.query.data;
  const latitude = searchQuery.latitude;
  const longitude = searchQuery.longitude;
  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${latitude},${longitude}`

  superagent.get(url)
    .then(data => {
      const body = data.body;
      const forecast = new Forecast(searchQuery, body);

      response.status(200).send(forecast.days);
    })
    .catch(err => {
      const error = new Error(err);
      console.error(err);
      response.status(error.status).send(error.responseText);
    });
}

/**
 * Router to get the Event data from EventBrite API
 * @param {Object} request
 * @param {Object} response
 */
function getEvents(request, response) {
  const searchQuery = request.query.data;
  const latitude = searchQuery.latitude;
  const longitude = searchQuery.longitude;
  const url = `https://www.eventbriteapi.com/v3/events/search?location.longitude=${longitude}&location.latitude=${latitude}74&expand=venue&token=${process.env.EVENTBRITE_API_KEY}`;

  superagent.get(url)
    .then(data => {
      const body = data.body;
      const events = body.events.map(el => {
        const link = el.url;
        const name = el.name.text;
        const eventDate = el.start.local;
        const summary = el.summary;

        return new Event(link, name, eventDate, summary);
      });

      response.status(200).send(events);
    })
    .catch(err => {
      const error = new Error(err);
      console.error(err);
      response.status(error.status).send(error.responseText);
    })
}

function wildcardRouter(request, response) {
  response.status(500).send('Sorry, something went wrong');
}

/**
 * Constructors
 */

/**
 * Location constructor
 * @param {String} searchQuery - Query string input from the client
 * @param {Object} geoDataResults - Geo graphical data from Google
 */
function Location(searchQuery, geoDataResults) {
  const results = geoDataResults.results[0];

  this.search_query = searchQuery;
  this.formatted_query = results.formatted_address;
  this.latitude = results.geometry.location.lat;
  this.longitude = results.geometry.location.lng;
}

/**
 * Forecast constructor
 * @param {String} searchQuery - Query string input from the client
 * @param {Object} weatherDataResults - Weather data from Darksky API
 */
function Forecast(searchQuery, weatherDataResults) {
  const result = weatherDataResults.daily.data.map(day => {
    const obj = {};
    obj.forecast = day.summary;

    const date = new Date(0);
    date.setUTCSeconds(day.time);
    obj.time = date.toDateString();

    return obj;
  });

  this.days = result;
}

/**
 * Event constructor
 * @param {String} link - Link to the Event from EventBrite API
 * @param {String} name - Name of the days events from EventBrite API
 * @param {String} eventDate - Event date string
 * @param {String} summary - Event summary from EventBrite API
 */
function Event(link, name, eventDate, summary) {
  this.link = link;
  this.name = name;
  this.eventDate = eventDate;
  this.summary = summary;
}

function Error(err) {
  this.status = 500;
  this.responseText = 'Sorry, something went wrong.';
  this.error = err;
}

/**
 * PORT
 */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`listening to ${PORT}`);
});

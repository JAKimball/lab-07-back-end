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
app.use('*', wildcardRouter);

/**
 * Routers
 */

function getLocation(request, response) {
  let queryStr = request.query.data;
  let url = `https://maps.googleapis.com/maps/api/geocode/json?address=${queryStr}&key=${process.env.GOOGLE_API_KEY}`;

  superagent.get(url)
    .then(saResult => {
      const body = saResult.body;
      const location = new Location(queryStr, body);
      response.send(location);
    })
    .catch(err => {
      const error = new Error(err);
      console.error(err);
      response.status(error.status).send(error.responseText);
    });
}

function getWeather(request, response) {
  try {
    let searchQuery = request.query.data;
    const weatherDataResults = require('./data/darksky.json');

    const forecast = new Forecast(searchQuery, weatherDataResults);

    response.status(200).send(forecast.days);
  } catch (err) {
    const error = new Error(err);
    console.error(err);
    response.status(error.status).send(error.responseText);
  }
}

function wildcardRouter(request, response) {
  response.status(500).send('Sorry, something went wrong');
}

/**
 * Constructors
 */

function Location(searchQuery, geoDataResults) {
  const results = geoDataResults.results[0];

  this.search_query = searchQuery;
  this.formatted_query = results.formatted_address;
  this.latitude = results.geometry.location.lat;
  this.longitude = results.geometry.location.lng;
}

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

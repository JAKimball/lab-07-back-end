'use strict';

const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
require('dotenv').config();

function Error(err) {
  this.status = 500;
  this.responseText = 'Sorry, something went wrong.';
  this.error = err;
}

/**
 * Routes
 */

// Location

app.get('/location', (request, response) => {
  try {
    let searchQuery = request.query.data;
    const geoDataResults = require('./data/geo.json');

    const locations = new Location(searchQuery, geoDataResults);

    response.status(200).send(locations);
  }
  catch (err) {
    const error = new Error(err);
    console.error(err);
    response.status(error.status).send(error.responseText);
  }
});

function Location(searchQuery, geoDataResults) {
  const results = geoDataResults.results[0];

  this.search_query = searchQuery;
  this.formatted_query = results.formatted_address;
  this.latitude = results.geometry.location.lat;
  this.longitude = results.geometry.location.lng;
}

// Weather

app.get('/weather', (request, response) => {
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
});

function Forecast(searchQuery, weatherDataResults) {
  const result = [];
  weatherDataResults.daily.data.forEach(day => {
    const obj = {};
    obj.forecast = day.summary;

    const date = new Date(0);
    date.setUTCSeconds(day.time);
    obj.time = date.toDateString();

    result.push(obj);
  });

  this.days = result;
}

app.use('*', (request, response) => {
  response.status(500).send('Sorry, something went wrong');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`listening to ${PORT}`);
});


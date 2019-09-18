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

// Location

app.get('/location', (request, response) => {
  try {
    let searchQuery = request.query.data;
    const geoDataResults = require('./data/geo.json');

    const locations = new Location(searchQuery, geoDataResults);

    response.status(200).send(locations);
  }
  catch (err) {
    console.error(err);
    const error = new Error(err);
    response.status(500).send(error);
  }
});

function Location(searchQuery, geoDataResults) {
  this.search_query = searchQuery;
  this.formatted_query = geoDataResults.results[0].formatted_address;
  this.latitude = geoDataResults.results[0].geometry.location.lat;
  this.longitude = geoDataResults.results[0].geometry.location.lng;
}


// Weather

app.get('/weather', (request, response) => {
  try {
    let searchQuery = request.query.data;
    const weatherDataResults = require('./data/darksky.json');

    const forecast = new Forecast(searchQuery, weatherDataResults);

    response.status(200).send(forecast);
  } catch (err) {
    console.error(err);
  }
});

function Forecast(searchQuery, weatherDataResults) {
  console.log(weatherDataResults);
  const result = [];
  weatherDataResults.daily.data.forEach(day => {
    const obj = {};
    obj.forecast = day.summary;

    const date = new Date(0);
    date.setUTCSeconds(day.time);
    obj.time = date.toDateString();

    result.push(obj);
  });
  return result;
}

app.use('*', (request, response) => {
  response.status(500).send('Sorry, something went wrong');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`listening to ${PORT}`);
});


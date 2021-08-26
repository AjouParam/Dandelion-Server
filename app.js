'use strict';

const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const session = require('express-session');
const router = require('./src/routes');
const db = require('./src/config/db');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(logger('combined'));
app.use('/', router);
/*
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({
      url: "mongodb://localhost/test",
      collection: "sessions"
    })
  }));
*/
module.exports = app;

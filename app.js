'use strict';

const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const session = require('express-session');
const router = require('./src/routes');
const db = require('./src/config/db');
const socket = require('./src/socket/index');

const app = express();
app.use(session({ secret: 'MySecret', resave: false, saveUninitialized: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(logger('combined'));
app.use('/', router);
const http = require('http').createServer(app);
const io = require('socket.io')(http);
socket.getSocket(io);
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

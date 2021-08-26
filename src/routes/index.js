'use strict';

const express = require('express');
const router = express.Router();
const ctrl = require('./controller');

//account
router.post('/account/signup', ctrl.account.signup);
router.post('/account/signin', ctrl.account.signin);
//router.post("/login", ctrl.account.login);

module.exports = router;

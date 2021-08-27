'use strict';

const express = require('express');
const router = express.Router();
const ctrl = require('./controller');

//account
router.post('/account/signup', ctrl.account.signup);
router.post('/account/signin', ctrl.account.signin);
//router.post("/login", ctrl.account.login);
//닉네임 중복 검사 필요

module.exports = router;

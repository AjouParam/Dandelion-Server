'use strict';

const express = require('express');
const router = express.Router();
const ctrl = require('./controller');

//account
router.post('/account/signUp', ctrl.account.signUp);
router.post('/account/signIn', ctrl.account.signIn);
//router.post("/login", ctrl.account.login);
//닉네임 중복 검사 필요

module.exports = router;

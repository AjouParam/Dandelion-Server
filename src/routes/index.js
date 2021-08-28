'use strict';

const express = require('express');
const router = express.Router();
const ctrl = require('./controller');
const verifyToken = require('./middlewares');
//account
router.post('/account/signUp', ctrl.account.signUp);
router.post('/account/signIn', ctrl.account.signIn);
router.get('/test', verifyToken, (req, res) => {
  res.json(req.user);
});
//router.post("/login", ctrl.account.login);
//닉네임 중복 검사 필요

module.exports = router;

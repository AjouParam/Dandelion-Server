'use strict';

const express = require('express');
const router = express.Router();
const ctrl = require('./controller');
const verifyToken = require('./middlewares');

//account
router.post('/account/signUp', ctrl.account.signUp);
router.post('/account/signIn', ctrl.account.signIn);
router.post('/account/resetPwd', ctrl.account.resetPwd);
// router.post('/account/withdrawal', ctrl.account.withDrawal);
router.get('/test', verifyToken, (req, res) => {
  res.json(req.decoded);
});
//router.post("/login", ctrl.account.login);

//닉네임 중복 검사 필요
router.post('/account/checkEmail', ctrl.account.checkEmail);
router.post('/account/checkName', ctrl.account.checkName);

//email
router.post('/account/auth', ctrl.email.sendEmail);
module.exports = router;

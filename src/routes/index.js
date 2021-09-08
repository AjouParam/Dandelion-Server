'use strict';

const express = require('express');
const router = express.Router();
const account = require('./controller/accountControl');
const verifyToken = require('./provider/verifyToken');

//account
router.post('/account/signUp', account.signUp);
router.post('/account/signIn', account.signIn);
router.post('/account/resetPwd', account.resetPwd);
router.post('/account/verifyCode', account.verifyCode);
router.post('/account/google', account.googleSignIn);
// router.post('/account/withdrawal', account.withDrawal);
router.post('/account/checkEmail', account.checkEmail);
router.post('/account/checkName', account.checkName);

//email
router.post('/account/auth', account.sendEmail);

router.post('/account/extendToken', verifyToken, (req, res) => {});
router.get('/test', verifyToken, (req, res) => {
  res.json(req.decoded);
});
module.exports = router;

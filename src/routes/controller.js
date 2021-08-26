'use strict';

//mongodb user model
const User = require('../models/User');
const bcrypt = require('bcrypt');

var nameRegex = /^[가-힣a-zA-Z0-9]{2,8}/i;
var emailRegex = /^[\w\.]+@[\w](\.?[\w])*\.[a-z]{2,3}$/i;
var passwordRegex = /^(?=.*[a-z])(?=.*\d)(?=.*\W).{8,16}$/i;

const account = {
  signup: async (req, res) => {
    let { name, email, password } = req.body;
    name = name.trim();
    email = email.trim();
    password = password.trim();

    if (name == '' || email == '' || password == '') {
      res.json({
        status: 'FAILED',
        message: '빈 문자열입니다.',
      });
    } else if (!nameRegex.test(name)) {
      res.json({
        status: 'FAILED',
        message: '영어, 한글, 숫자만 허용하며, 2자 이상 8자 이내여야 합니다.',
      });
    } else if (!emailRegex.test(email)) {
      res.json({
        status: 'FAILED',
        message: '올바르지 않은 양식입니다.',
      });
    } else if (!passwordRegex.test(password)) {
      res.json({
        status: 'FAILED',
        message: '영어, 숫자, 특수문자 혼용 8자 이상이어야 합니다.',
      });
    } else {
      // 이미 가입된 user인지 확인
      User.find({ email })
        .then((result) => {
          if (result.length) {
            //이미 가입된 user가 있음.
            res.json({
              status: 'FAILED',
              message: '이미 가입된 사용자입니다.',
            });
          } else {
            // user 생성
            // password handling
            const saltRounds = 10;
            bcrypt
              .hash(password, saltRounds)
              .then((hashedPassword) => {
                const newUser = new User({
                  name,
                  email,
                  password: hashedPassword,
                });
                newUser
                  .save()
                  .then((result) => {
                    res.json({
                      status: 'SUCCESS',
                      message: '회원가입이 성공적으로 완료되었습니다',
                      data: result,
                    });
                  })
                  .catch((err) => {
                    res.json({
                      status: 'FAILED',
                      message: '회원가입 중 에러가 발생하였습니다.',
                    });
                  });
              })
              .catch((err) => {
                res.json({
                  status: 'FAILED',
                  message: '비밀번호 해시 과정에서 에러가 발생하였습니다.',
                });
              });
          }
        })
        .catch((err) => {
          console.log(err);
          res.json({
            status: 'FAILED',
            message: '로그인 중 에러가 발생하였습니다.',
          });
        });
    }
  },
  signin: async (req, res) => {},
};

module.exports = {
  account,
};

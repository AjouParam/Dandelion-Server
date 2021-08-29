'use strict';

//mongodb user model
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY;
const saltRounds = 10;

let nameRegex = /^[가-힣a-zA-Z0-9]{2,8}/i;
let emailRegex = /^[\w\.]+@[\w](\.?[\w])*\.[a-z]{2,3}$/i;
let passwordRegex = /^(?=.*[a-z])(?=.*\d)(?=.*\W).{8,16}$/i;
let accessTokenOptions = { expiresIn: '14d', subject: 'userInfo' };

function toJson(message, status = false) {
  this.json({
    status: status ? 'SUCCESS' : 'FAILED',
    message: message,
  });
}

const account = {
  signUp: async (req, res) => {
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

  signIn: async (req, res) => {
    let { email, password } = req.body;
    email = email.trim();
    password = password.trim();

    if (email == '' || password == '') {
      res.json({
        status: 'FAILED',
        message: '빈 문자열입니다.',
      });
    } else {
      User.find({ email })
        .then((data) => {
          if (data.length) {
            // 가입된 사용자
            const accessToken = jwt.sign(
              {
                _id: data[0]._id,
                name: data[0].name,
                email: data[0].email,
              },
              SECRET_KEY,
              accessTokenOptions,
            );
            const hashedPassword = data[0].password;
            bcrypt
              .compare(password, hashedPassword)
              .then((result) => {
                if (result) {
                  // 비밀번호 일치
                  res.json({
                    status: 'SUCCESS',
                    message: '로그인에 성공했습니다.',
                    accessToken: accessToken,
                  });
                } else {
                  res.json({
                    status: 'FAILED',
                    message: '올바르지 않은 비밀번호입니다.',
                  });
                }
              })
              .catch((err) => {
                res.json({
                  status: 'FAILED',
                  message: '비밀번호 확인 중 에러가 발생하였습니다.',
                });
              });
          } else {
            res.json({
              status: 'FAILED',
              message: '가입하지 않은 사용자입니다.',
            });
          }
        })
        .catch((err) => {
          res.json({
            status: 'FAILED',
            message: '사용자가 존재하는지 확인 중 에러가 발생하였습니다.',
          });
        });
    }
  },

  resetPwd: async (req, res) => {
    let { email, password } = req.body;
    email = email.trim();
    password = password.trim();
    if (!email || !password) {
      toJson.bind(res)('빈 문자열입니다.');
    } else {
      User.find({ email })
        .then((data) => {
          if (data.length)
            bcrypt
              .hash(password, saltRounds)
              .then((hashedPassword) =>
                User.updateOne({ email: data[0].email }, { $set: { password: hashedPassword } }).then((element) =>
                  toJson.bind(res)('성공적으로 변경이 완료되었습니다.', true),
                ),
              );
          else toJson.bind(res)('존재하지 않는 사용자입니다.');
        })
        .catch((err) => {
          toJson.bind(res)('사용자가 존재하는지 확인 중 에러가 발생하였습니다.');
        });
    }
  },

  // withDrawal: async (req, res) => {
  //   let { email } = req.body;
  //   email = email.trim();

  //   if (email === '') {
  //     res.json({
  //       status: 'FAILED',
  //       message: '빈 문자열입니다.',
  //     });
  //   } else if (!emailRegex.test(email)) {
  //     res.json({
  //       status: 'FAILED',
  //       message: '올바르지 않은 양식입니다.',
  //     });
  //   } else {
  //     User.find({ email })
  //       .then((data) => {
  //         if (data.length) {
  //           const hashedPassword = data[0].password;
  //           bcrypt
  //             .compare(password, hashedPassword)
  //             .then((result) => {
  //               if (result) {
  //                 // 비밀번호 일치
  //                 res.json({
  //                   status: 'SUCCESS',
  //                   message: '로그인에 성공했습니다.',
  //                   accessToken: accessToken,
  //                 });
  //               } else {
  //                 res.json({
  //                   status: 'FAILED',
  //                   message: '올바르지 않은 비밀번호입니다.',
  //                 });
  //               }
  //             })
  //             .catch((err) => {
  //               res.json({
  //                 status: 'FAILED',
  //                 message: '비밀번호 확인 중 에러가 발생하였습니다.',
  //               });
  //             });
  //         } else {
  //           res.json({
  //             status: 'FAILED',
  //             message: '가입하지 않은 사용자입니다.',
  //           });
  //         }
  //       })
  //       .catch((err) => {
  //         res.json({
  //           status: 'FAILED',
  //           message: '사용자가 존재하는지 확인 중 에러가 발생하였습니다.',
  //         });
  //       });
  //   }
  // },

  checkEmail: async (req, res) => {
    let { email } = req.body;
    email = email.trim();
    if (email === '') toJson.bind(res)('빈 문자열입니다.');
    else if (!emailRegex.test(email)) toJson.bind(res)('올바르지 않은 양식입니다.');
    else {
      User.find({ email })
        .then((data) => {
          data.length
            ? toJson.bind(res)('이미 가입된 이메일입니다.')
            : toJson.bind(res)('사용가능한 이메일입니다.', true);
        })
        .catch((err) => {});
    }
  },

  checkName: async (req, res) => {
    let { name } = req.body;
    name = name.trim();
    if (name === '') toJson.bind(res)('빈 문자열입니다.');
    else if (!nameRegex.test(name)) toJson.bind(res)('올바르지 않은 양식입니다.');
    else {
      User.find({ name })
        .then((data) =>
          data.length
            ? toJson.bind(res)('이미 사용중인 닉네임입니다.')
            : toJson.bind(res)('사용가능한 닉네임입니다.', true),
        )
        .catch((err) => {});
    }
  },
};

module.exports = {
  account,
};

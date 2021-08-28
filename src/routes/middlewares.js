const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;

const verifyToken = (req, res, next) => {
  try {
    const accessToken = req.headers['x-access-token'] || req.body.token || req.query.token;
    //클라이언트에서 어떤 방법으로 보낼지 결정해야할듯
    if (!accessToken) {
      return res.status(403).json({ status: 'FAILED', message: '사용자 인증을 위한 토큰이 존재하지 않습니다.' });
    }
    req.user = jwt.verify(accessToken, SECRET_KEY);
    return next();
  } catch (error) {
    if (error.name == 'TokenExpiredError') {
      return res.status(419).json({
        status: 'FAILED',
        message: '토큰이 만료되었습니다.',
      });
    }
    return res.status(401).json({ status: 'FAILED', message: '토큰이 유효하지 않습니다.' });
  }
};

module.exports = verifyToken;

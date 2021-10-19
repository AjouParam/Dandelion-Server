const moment = require('moment-timezone');

const getKoreanTime = async () => {
  moment.tz.setDefault('Asia/Seoul');
  const curr = new Date();
  return moment().format();
};

module.exports = { getKoreanTime };

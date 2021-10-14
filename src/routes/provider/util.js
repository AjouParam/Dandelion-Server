const moment = require('moment');
const getKoreanTime = async () => {
  const curr = new Date();
  return moment(curr.getTime()).tz('Asia/Seoul');
};

module.exports = { getKoreanTime };

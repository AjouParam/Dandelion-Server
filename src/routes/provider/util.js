const getKoreanTime = (year, month, date) => {
  let curr;
  if (year || month || date) curr = new Date(year, month, date);
  else curr = new Date();
  curr.setHours(curr.getHours() + 9);
  return curr;
};

module.exports = { getKoreanTime };

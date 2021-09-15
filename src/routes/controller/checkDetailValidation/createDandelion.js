const checkName = (name) => {};
const checkPositionType = (longitude, latitude) =>
  toString.call(longitude) === '[object Number]' && toString.call(latitude) === '[object Number]' ? false : true;

module.exports = { checkName, checkPositionType };

const checkName = (name) => {};
const checkPositionType = (longitude, latitude) =>
  ['int', 'float'].includes(typeof longitude) && ['int', 'float'].includes(typeof latitude) ? false : true;

module.exports = { checkName, checkPositionType };

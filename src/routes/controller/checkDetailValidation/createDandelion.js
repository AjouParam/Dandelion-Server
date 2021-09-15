const checkPositionNumberType = (longitude, latitude) =>
  toString.call(longitude) === '[object Number]' && toString.call(latitude) === '[object Number]' ? false : true;

const checkNameType = (name) => {};

const checkPositionType = (longitude, latitude) => {
  if (toString.call(longitude) === '[object Undefined]' || toString.call(latitude) === '[object Undefined]') {
    return `${toString.call(longitude) === '[object Undefined]' ? `longitude가 정의되어 있지 않습니다.` : ``}
    ${toString.call(latitude) === '[object Undefined]' ? `latitude가 정의되어 있지 않습니다.` : ``}`;
  } else if (checkPositionNumberType(longitude, latitude)) {
    return `타입이 맞지 않습니다. 현재 타입은 longitude: ${typeof longitude} latitude: ${typeof latitude}`;
  } else {
    return '';
  }
};

const checkDescriptionType = (description) =>
  toString.call(description) !== '[object String]'
    ? `타입이 맞지 않습니다. 현재 타입은 ${toString.call(description)}`
    : ``;

module.exports = { checkNameType, checkPositionType, checkDescriptionType };

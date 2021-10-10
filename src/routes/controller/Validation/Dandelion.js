const Dandelion = require('../../../models/Dandelion');
const Post = require('../../../models/Post');
let nameRegex = /^[가-힣a-zA-Z0-9\s]{1,10}$/;

const checkPositionNumberType = async (longitude, latitude) =>
  toString.call(longitude) === '[object Number]' && toString.call(latitude) === '[object Number]' ? false : true;

const checkNameType = async (name) => (!nameRegex.test(name) ? `정해진 양식에 맞지 않습니다.` : ``);

const checkPositionType = async (longitude, latitude) => {
  if (toString.call(longitude) === '[object Undefined]' || toString.call(latitude) === '[object Undefined]') {
    return `${toString.call(longitude) === '[object Undefined]' ? `longitude가 정의되어 있지 않습니다.` : ``}
    ${toString.call(latitude) === '[object Undefined]' ? `latitude가 정의되어 있지 않습니다.` : ``}`;
  } else if (await checkPositionNumberType(longitude, latitude)) {
    return `타입이 맞지 않습니다. 현재 타입은 longitude: ${typeof longitude} latitude: ${typeof latitude}`;
  } else {
    return '';
  }
};

const checkDescriptionType = async (description) =>
  toString.call(description) !== '[object String]'
    ? `타입이 맞지 않습니다. 현재 타입은 ${toString.call(description)}`
    : ``;

const checkAlreadyExist = async (longitude, latitude) =>
  Dandelion.find({ coordinates: [longitude, latitude] }).then((data) => {
    return data.length ? true : false;
  });

const checkNotExist = async (_id) =>
  Dandelion.findById(_id).then((data) => {
    return data ? false : true;
  });

const checkPost = async (dandelionId, userId, postId) =>
  Post.findById(postId)
    .select('_dandelion _user')
    .then((result) => {
      if (!result) return '존재하지 않는 게시글입니다.';
      if (dandelionId != result._dandelion) return '게시글 인덱스가 민들레 인덱스와 매치되지 않습니다.';
      if (userId != result._user) return '권한이 없습니다.';
      return '';
    })
    .catch((err) => {
      console.log(err);
      return '게시글 Validation 중 에러가 발생하였습니다.';
    });
const checkEvent = async (dandelionId, userId, eventId) =>
  Event.findById(eventId)
    .select('_dandelion _user')
    .then((result) => {
      if (!result) return '존재하지 않는 이벤트입니다.';
      if (dandelionId != result._dandelion) return '이벤트 인덱스가 민들레 인덱스와 매치되지 않습니다.';
      if (userId != result._user) return '권한이 없습니다.';
      return '';
    })
    .catch((err) => {
      console.log(err);
      return '이벤트 Validation 중 에러가 발생하였습니다.';
    });
module.exports = {
  checkNameType,
  checkPositionType,
  checkDescriptionType,
  checkAlreadyExist,
  checkNotExist,
  checkPost,
  checkEvent,
};

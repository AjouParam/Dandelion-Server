const Dandelion = require('../../models/Dandelion');
const { resultResponse, basickResponse } = require('../../config/response');
const { checkName, checkPositionType } = require('./checkDetailValidation/createDandelion');

const dandelion = {
  create: async (req, res) => {
    console.log(req.decoded);
    const userId = req.decoded._id;
    const { name, latitude, longitude, description } = req.body;
    //validation check 필요
    // type check와 undefined 아닌지 체크
    // name : 한글영어숫자 혼용 공백 포함 8자 이내.
    // latitude, longigutde : 실수 ✅,✅
    // description : string
    // 완성해주시고 git wiki까지 작성해주시면 감사하겠습니다 ㅎㅎ

    if (!name || !latitude || !longitude || !description)
      res.json(basickResponse('Request Body에 정보가 누락되었습니다.'));

    if (toString.call(longitude) === '[object Undefined]' || toString.call(latitude) === '[object Undefined]') {
      res.json(
        basickResponse(
          `${toString.call(longitude) === '[object Undefined]' ? `longitude가 정의되어 있지 않습니다.` : ``}${
            toString.call(latitude) === '[object Undefined]' ? `latitude가 정의되어 있지 않습니다.` : ``
          }`,
        ),
      );
    } else if (checkPositionType(longitude, latitude)) {
      res.json(
        basickResponse(
          `위치 타입이 맞지 않습니다. 현재 타입은 longitude: ${typeof longitude} latitude: ${typeof latitude}`,
        ),
      );
    }
    const newDandelion = new Dandelion({
      name,
      _creator: userId,
      longitude: float(longitude),
      latitude: float(latitude),
      description,
      level: 1,
    });
    newDandelion
      .save()
      .then((result) => res.json(resultResponse('민들레 생성에 성공했습니다.', true, { data: result })))
      .catch((err) => {
        console.log(err);
        res.json(basickResponse('민들레 생성 중 에러가 발생하였습니다.'));
      });
  },
  get: async (req, res) => {},
};

module.exports = dandelion;

const Dandelion = require('../../models/Dandelion');
const { resultResponse, basicResponse } = require('../../config/response');
const { checkNameType, checkPositionType, checkDescriptionType } = require('./checkDetailValidation/createDandelion');

const dandelion = {
  create: async (req, res) => {
    console.log(req.decoded);
    const userId = req.decoded._id;
    const { name, latitude, longitude, description } = req.body;
    //validation check 필요
    // type check와 undefined 아닌지 체크
    // name : 한글영어숫자 혼용 공백 포함 8자 이내.
    // latitude, longitude : 실수 ✅,✅
    // description : string
    // 완성해주시고 git wiki까지 작성해주시면 감사하겠습니다 ㅎㅎ

    if (!name || !latitude || !longitude || !description)
      res.json(basicResponse('Request Body에 정보가 누락되었습니다.'));

    const nameMessage = checkNameType(name);
    nameMessage ? res.json(basicResponse(nameMessage)) : null;

    const positionMessage = checkPositionType(longitude, latitude);
    positionMessage ? res.json(basicResponse(positionMessage)) : null;

    const descriptionMessage = checkDescriptionType(description);
    descriptionMessage ? res.json(basicResponse(descriptionMessage)) : null;

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
        res.json(basicResponse('민들레 생성 중 에러가 발생하였습니다.'));
      });
  },
  get: async (req, res) => {},
};

module.exports = dandelion;

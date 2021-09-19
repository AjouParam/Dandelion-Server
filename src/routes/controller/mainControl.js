const Dandelion = require('../../models/Dandelion');
const { resultResponse, basicResponse } = require('../../config/response');
const { checkNameType, checkPositionType, checkDescriptionType } = require('./checkDetailValidation/Dandelion');

const dandelion = {
  create: async (req, res) => {
    const userId = req.decoded._id;
    const { name, location, description } = req.body;
    //validation check 필요
    // type check와 undefined 아닌지 체크 ✅,✅
    // name : 한글영어숫자 혼용 공백 포함 8자 이내. ✅
    // latitude, longitude : 실수 ✅,✅
    // description : string ✅,✅
    // 완성해주시고 git wiki까지 작성해주시면 감사하겠습니다 ㅎㅎ

    if (!name || !location.latitude || !location.longitude)
      return res.json(basicResponse('Request Body에 정보가 누락되었습니다.'));
    //description 없다면 description : ""로 보내줄 것.
    const nameMessage = checkNameType(name);
    if (nameMessage) return res.json(basicResponse(nameMessage));

    const positionMessage = checkPositionType(location.longitude, location.latitude);
    if (positionMessage) return res.json(basicResponse(positionMessage));

    const descriptionMessage = checkDescriptionType(description);
    if (descriptionMessage) return res.json(basicResponse(descriptionMessage));

    const newDandelion = new Dandelion({
      name,
      _creator: userId,
      location: {
        type: 'Point',
        coordinates: [location.longitude, location.latitude],
      },
      description,
      level: 1,
      createdAt: Date.now(),
    });
    newDandelion
      .save()
      .then((result) => res.json(resultResponse('민들레 생성에 성공했습니다.', true, { data: result })))
      .catch((err) => {
        console.log(err);
        return res.json(basicResponse('민들레 생성 중 에러가 발생하였습니다.'));
      });
  },
  get: async (req, res) => {
    const { userPosition, maxDistance } = req.body;

    if (!userPosition || !maxDistance) return res.json(basicResponse('Request Body에 정보가 누락되었습니다.'));

    if (!userPosition.latitude || !userPosition.longitude)
      return res.json(basicResponse('uppderLeftPosition의 위치 정보가 누락되었습니다.'));

    const positionMessage = checkPositionType(userPosition.longitude, userPosition.latitude);
    if (positionMessage) return res.json(basicResponse(positionMessage));

    Dandelion.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [userPosition.longitude, userPosition.latitude],
          },
          $maxDistance: maxDistance,
        },
      },
    })
      .select('_id location level name')
      .limit(100)
      .then((result) => {
        let response = [];
        for (let i = 0; i < result.length; i++) {
          let resObj = {};
          resObj.name = result[i].name;
          resObj.level = result[i].level;
          resObj._id = result[i]._id;
          resObj.location = {};
          resObj.location.longitude = result[i].location.coordinates[0];
          resObj.location.latitude = result[i].location.coordinates[1];
          resObj.ovelap = false;
          response.push(resObj);
        }

        return res.json(resultResponse('민들레 불러오기에 성공했습니다.', true, { data: response }));
      })
      .catch((err) => {
        console.log(err);
        return res.json(basicResponse('민들레 불러오기 중 에러가 발생하였습니다.'));
      });
  },
};

module.exports = dandelion;

const Dandelion = require('../../models/Dandelion');
const { resultResponse, basicResponse } = require('../../config/response');
const { checkNameType, checkPositionType, checkDescriptionType, checkAlreadyExist } = require('./Validation/Dandelion');
const { getKoreanTime } = require('../provider/util');

const dandelion = {
  create: async (req, res) => {
    const userId = req.decoded._id;
    const { name, location, description } = req.body;

    if (!name || !location.latitude || !location.longitude)
      return res.json(basicResponse('Request Body에 정보가 누락되었습니다.'));
    //description 없다면 description : ""로 보내줄 것.
    const nameMessage = await checkNameType(name);
    if (nameMessage) return res.json(basicResponse(nameMessage));

    const positionMessage = await checkPositionType(location.longitude, location.latitude);
    if (positionMessage) return res.json(basicResponse(positionMessage));

    const descriptionMessage = await checkDescriptionType(description);
    if (descriptionMessage) return res.json(basicResponse(descriptionMessage));

    const ExistPositionMessage = await checkAlreadyExist(location.longitude, location.latitude);
    if (ExistPositionMessage) return res.json(basicResponse(ExistPositionMessage));

    const newDandelion = new Dandelion({
      name,
      _creator: userId,
      location: {
        type: 'Point',
        coordinates: [location.longitude, location.latitude],
      },
      description,
      level: 1,
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
    const { centerPosition, maxDistance } = req.body;

    if (!centerPosition || !maxDistance) return res.json(basicResponse('Request Body에 정보가 누락되었습니다.'));

    if (!centerPosition.latitude || !centerPosition.longitude)
      return res.json(basicResponse('위치 정보가 누락되었습니다.'));

    const positionMessage = await checkPositionType(centerPosition.longitude, centerPosition.latitude);
    if (positionMessage) return res.json(basicResponse('해당 위치에 이미 민들레가 존재합니다.'));

    Dandelion.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [centerPosition.longitude, centerPosition.latitude],
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
          response.push(resObj);
          resObj = null;
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

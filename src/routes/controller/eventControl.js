const Dandelion = require('../../models/Dandelion');
const { resultResponse, basicResponse } = require('../../config/response');
const Event = require('../../models/Event');
const { checkNotExist, checkEvent } = require('./Validation/Dandelion');
const { getKoreanTime } = require('../provider/util');

const event = {
  create: async (req, res) => {
    const userId = req.decoded._id;
    const dandelionId = req.params.dandelionId;
    const { title, text, location, images, rewards, firstComeNum } = req.body;
    const isDandelionNotExist = await checkNotExist(dandelionId);
    if (isDandelionNotExist) return res.json(basicResponse('해당 민들레가 존재하지 않습니다.', false));
    const newEvent = new Event({
      _user: userId,
      _dandelion: dandelionId,
      location: {
        type: 'Point',
        coordinates: [location.longitude, location.latitude],
      },
      firstComeNum,
      title,
      text,
      rewards,
      images: images,
      createdAt: await getKoreanTime(),
      startDate: await getKoreanTime(),
    });
    newEvent
      .save()
      .then((result) => res.json(resultResponse('이벤트를 생성하였습니다.', true, { data: result })))
      .catch((err) => {
        console.log(err);
        return res.json(basicResponse('이벤 트 생성 중 에러가 발생하였습니다.'));
      });
  },
  delete: async (req, res) => {
    const userId = req.decoded._id;
    const { eventId, dandelionId } = req.params;
    const isDandelionNotExist = await checkNotExist(dandelionId);
    if (isDandelionNotExist) return res.json(basicResponse('해당 민들레가 존재하지 않습니다.', false));

    const checkEventMessage = await checkEvent(dandelionId, userId, eventId);
    if (checkEventMessage) return res.json(basicResponse(checkEventMessage));

    Event.deleteOne({ _id: eventId, _dandelion: dandelionId })
      .then(res.json(basicResponse('이벤트를 삭제하였습니다.', true)))
      .catch((err) => {
        console.log(err);
        return res.json(basicResponse('이벤트 삭제 중 에러가 발생하였습니다.'));
      });
  },
  get: async (req, res) => {},
  update: async (req, res) => {},
};

module.exports = event;

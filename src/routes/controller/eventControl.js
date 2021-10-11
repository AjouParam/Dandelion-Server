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
        return res.json(basicResponse('이벤트 생성 중 에러가 발생하였습니다.'));
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
  get: async (req, res) => {
    const dandelionId = req.params.dandelionId;
    const isDandelionNotExist = await checkNotExist(dandelionId);
    if (isDandelionNotExist) return res.json(basicResponse('해당 민들레가 존재하지 않습니다.', false));

    Event.find({ _dandelion: dandelionId })
      .populate({ path: '_user', select: 'name thumbnail' })
      .select(
        '_id location createdAt updatedAt title text images _dandelion _user likes firstComeNum rewards status startDate',
      )
      .then((result) => {
        let response = [];
        for (let i = 0; i < result.length; i++) {
          let resObj = {};
          resObj._id = result[i]._id;
          resObj.location = {};
          resObj.location.longitude = result[i].location.coordinates[0];
          resObj.location.latitude = result[i].location.coordinates[1];
          resObj.createdAt = result[i].createdAt;
          resObj.updatedAt = result[i].updatedAt;
          resObj._dandelion = result[i]._dandelion;
          resObj._user = result[i]._user;
          resObj.title = result[i].title;
          resObj.text = result[i].text;
          resObj.images = result[i].images;
          resObj.firstComeNum = result[i].firstComeNum;
          resObj.rewards = result[i].rewards;
          resObj.status = result[i].status;
          resObj.startDate = result[i].startDate;
          response.push(resObj);
          resObj = null;
        }
        res.json(resultResponse('민들레에 해당하는 이벤트입니다.', true, { data: response }));
      })
      .catch((err) => {
        console.log(err);
        return res.json(basicResponse('이벤트 가져오는 중 에러가 발생하였습니다.'));
      });
  },
  update: async (req, res) => {
    const userId = req.decoded._id;
    const { dandelionId, eventId } = req.params;
    const { changedText = text, changedTitle = title, images } = req.body.text;

    if (!mongoose.isValidObjectId(eventId)) return res.json(basicResponse(' 이벤트의 Object Id가 올바르지 않습니다.'));
    if (!mongoose.isValidObjectId(dandelionId))
      return res.json(basicResponse('이벤트의 Object Id가 올바르지 않습니다.'));

    const isDandelionNotExist = await checkNotExist(dandelionId);
    if (isDandelionNotExist) return res.json(basicResponse('해당 민들레가 존재하지 않습니다.'));

    const checkEventMessage = await checkEvent(dandelionId, userId, eventId);
    if (checkEventMessage) return res.json(basicResponse(checkEventMessage));

    Post.updateOne(
      { _id: eventId, _dandelion: dandelionId },
      { text: changedText, title: changedTitle, updatedAt: await getKoreanTime(), images: images },
    )
      .then(res.json(basicResponse('이벤트가 수정되었습니다.', true)))
      .catch((err) => {
        console.log(err);
        return res.json(basicResponse('이벤트 수정 중 에러가 발생하였습니다.'));
      });
  },
};

module.exports = event;

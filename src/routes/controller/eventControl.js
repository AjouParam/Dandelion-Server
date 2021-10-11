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
    const page = parseInt(req.query.page);
    const maxPost = parseInt(req.query.maxPost);
    const hidePost = page === 1 ? 0 : (page - 1) * maxPost;

    if (!page || !maxPost) return res.json(basicResponse('페이지와 관련된 query parameter가 누락되었습니다.'));

    const isDandelionNotExist = await checkNotExist(dandelionId);
    if (isDandelionNotExist) return res.json(basicResponse('해당 민들레가 존재하지 않습니다.', false));

    Event.aggregate([
      { $match: { _dandelion: mongoose.Types.ObjectId(dandelionId) } },
      {
        $lookup: {
          from: 'users',
          localField: '_user',
          foreignField: '_id',
          as: '_user',
        },
      },
      { $unwind: '$_user' },
      { $sort: { createdAt: -1 } },
      { $skip: hidePost },
      { $limit: maxPost },
      {
        $lookup: {
          from: 'eventcomments',
          localField: '_id',
          foreignField: '_event',
          as: 'comments',
        },
      },
      {
        $lookup: {
          from: 'eventlikes',
          localField: '_id',
          foreignField: '_post',
          as: 'likes',
        },
      },
      {
        $project: {
          location: {
            longitude: { $arrayElemAt: ['$location.coordinates', 0] },
            latitude: { $arrayElemAt: ['$location.coordinates', 1] },
          },
          createdAt: 1,
          updatedAt: 1,
          title: 1,
          text: 1,
          images: 1,
          _dandelion: 1,
          '_user._id': 1,
          '_user.name': 1,
          '_user.thumbnail': 1,
          comments: { $size: '$comments' },
          likes: { $size: '$likes' },
          firstComeNum: 1,
          rewards: 1,
          status: 1,
          startDate: 1,
        },
      },
    ])
      .then((result) => {
        return res.json(resultResponse('민들레에 해당하는 게시글입니다.', true, { data: result }));
      })
      .catch((err) => {
        console.log(err);
        return res.json(basicResponse('게시글 가져오는 중 에러가 발생하였습니다.'));
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

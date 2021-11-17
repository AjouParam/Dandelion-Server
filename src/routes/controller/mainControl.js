const Dandelion = require('../../models/Dandelion');
const VisitHistory = require('../../models/VisitHistory');
const { resultResponse, basicResponse } = require('../../config/response');
const { checkNameType, checkPositionType, checkDescriptionType, checkAlreadyExist } = require('./Validation/Dandelion');
const { getKoreanTime } = require('../provider/util');
const mongoose = require('mongoose');

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
      createdAt: getKoreanTime(),
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

  getDetail: async (req, res) => {
    const dandelionId = req.params.dandelionId;
    const userId = req.decoded._id;
    const { currentPosition, maxDistance } = req.body;

    if (!dandelionId) return res.json(basicResponse('민들레 Id 정보가 누락되었습니다.'));
    if (!currentPosition || !currentPosition.latitude || !currentPosition.longitude)
      return res.json(basicResponse('위치 정보가 누락되었습니다.'));

    Dandelion.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [currentPosition.longitude, currentPosition.latitude] },
          spherical: true,
          distanceField: 'distance',
          distanceMuliplier: 0.001,
          query: { _id: mongoose.Types.ObjectId(dandelionId) },
          maxDistance: 470000000,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_creator',
          foreignField: '_id',
          as: '_creator',
        },
      },
      { $unwind: '$_creator' },
      { $sort: { createdAt: -1, distance: 1 } },
      {
        $lookup: {
          from: 'posts',
          as: 'events',
          let: { id: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ['$_dandelion', '$$id'] }, { $eq: ['$isEvent', true] }],
                },
              },
            },
          ],
        },
      },
      {
        $project: {
          location: {
            longitude: { $arrayElemAt: ['$location.coordinates', 0] },
            latitude: { $arrayElemAt: ['$location.coordinates', 1] },
          },
          createdAt: 1,
          description: 1,
          level: 1,
          distance: 1,
          cumulativeVisitors: 1,
          realTimeVisitors: 1,
          '_creator._id': 1,
          '_creator.name': 1,
          '_creator.thumbnail': 1,
          events: { $size: '$events' },
          name: 1,
        },
      },
    ])
      .then((result) => {
        //result[0] 으로 해야 배열 없앰.
        return res.json(resultResponse('민들레 상세 정보입니다.', true, { data: result }));
      })
      .catch((err) => {
        console.log(err);
        return res.json(basicResponse('민들레 상세 정보를 가져오는 중 에러가 발생하였습니다.'));
      });
  },

  visit: async (req, res) => {
    const dandelionId = req.params.dandelionId;
    const userId = req.decoded._id;
    const { currentPosition, maxDistance } = req.body;

    if (!dandelionId) return res.json(basicResponse('민들레 Id 정보가 누락되었습니다.'));
    if (!currentPosition || !currentPosition.latitude || !currentPosition.longitude)
      return res.json(basicResponse('위치 정보가 누락되었습니다.'));

    try {
      let { cumulativeVisitors } = await Dandelion.findById(dandelionId).select('cumulativeVisitors');
      let isGrowUp = false;
      if (cumulativeVisitors && (cumulativeVisitors == 9 || cumulativeVisitors == 39 || cumulativeVisitors == 99)) {
        isGrowUp = true;
      }

      let updateParam = isGrowUp
        ? {
            $inc: { cumulativeVisitors: 1, realTimeVisitors: 1, level: 1 },
          }
        : {
            $inc: { cumulativeVisitors: 1, realTimeVisitors: 1 },
          };

      await Dandelion.updateOne({ _id: dandelionId }, updateParam).catch((error) => {
        console.log(error);
        throw '민들레 방문자 수를 증가하는 중에 에러가 발생하였습니다.\nerror:' + error;
      });

      const newVisitHistory = new VisitHistory({
        _user: userId,
        _dandelion: dandelionId,
        createdAt: getKoreanTime(),
      });

      await newVisitHistory.save().catch((err) => {
        console.log(err);
        throw '민들레 방문 기록 생성 중 에러가 발생하였습니다.';
      });

      await Dandelion.aggregate([
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [currentPosition.longitude, currentPosition.latitude] },
            spherical: true,
            distanceField: 'distance',
            distanceMuliplier: 0.001,
            query: { _id: mongoose.Types.ObjectId(dandelionId) },
            maxDistance: 470000000,
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: '_creator',
            foreignField: '_id',
            as: '_creator',
          },
        },
        { $unwind: '$_creator' },
        { $sort: { createdAt: -1, distance: 1 } },
        {
          $lookup: {
            from: 'posts',
            as: 'events',
            let: { id: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ['$_dandelion', '$$id'] }, { $eq: ['$isEvent', true] }],
                  },
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: 'posts',
            as: 'images',
            let: { id: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ['$_dandelion', '$$id'] }, { $gte: [{ $size: '$images' }, 1] }],
                  },
                },
              },
              { $limit: 8 },
            ],
          },
        },
        {
          $project: {
            location: {
              longitude: { $arrayElemAt: ['$location.coordinates', 0] },
              latitude: { $arrayElemAt: ['$location.coordinates', 1] },
            },
            createdAt: 1,
            description: 1,
            level: 1,
            distance: 1,
            cumulativeVisitors: 1,
            realTimeVisitors: 1,
            '_creator._id': 1,
            '_creator.name': 1,
            '_creator.thumbnail': 1,
            events: { $size: '$events' },
            name: 1,
            recentImages: {
              $reduce: {
                input: { $ifNull: ['$images.images', []] },
                initialValue: [],
                in: { $concatArrays: ['$$value', '$$this'] },
              },
            },
          },
        },
      ])
        .then((result) => {
          return res.json(resultResponse('민들레 방문 정보를 저장하였습니다.', true, { data: result }));
        })
        .catch((err) => {
          console.log(err);
          throw '민들레 방문 정보를 가져오는 중 에러가 발생하였습니다.';
        });
    } catch (error) {
      console.log(error);
      return res.json(basicResponse('민들레 방문 모듈에서 에러가 발생하였습니다. ' + error));
    }
  },
  exit: async (req, res) => {
    const dandelionId = req.params.dandelionId;
    const userId = req.decoded._id;

    if (!dandelionId) return res.json(basicResponse('민들레 Id 정보가 누락되었습니다.'));

    try {
      await Dandelion.updateOne({ _id: dandelionId }, { $inc: { realTimeVisitors: -1 } }).catch((error) => {
        console.log(error);
        throw '민들레 실시간 방문자 수를 감소하는 중에 에러가 발생하였습니다. error:' + error;
      });
      return res.json(basicResponse('민들레 실시간 방문자 수가 1 감소하였습니다.', true));
    } catch (err) {
      console.log(error);
      return res.json(basicResponse('민들레 나감 모듈에서 에러가 발생하였습니다. ' + err));
    }
  },
};

module.exports = dandelion;

const Mail = require('../../models/Mail');
const { resultResponse, basicResponse } = require('../../config/response');
const ObjectId = require('mongodb').ObjectID;
const mail = {
  create: async (req, res) => {
    try {
      const { users, sender, message } = req.body;
      const newMail = new Mail({
        users,
        messageList: [{ sender, message, createAt: new Date() }],
      });
      const result = await newMail.save();
      res.json(resultResponse('쪽지방을 생성하였습니다.', true, { data: result }));
    } catch (err) {
      res.json(basicResponse('쪽지방 생성 중 에러가 발생하였습니다.'));
    }
  },
  load: async (req, res) => {
    try {
      const { user } = req.body;
      const result = await Mail.find({ users: user });
      res.json(
        resultResponse('성공적으로 가져왔습니다.', true, {
          data: result.reduce((result, element) => {
            result.push({
              _id: element._id,
              user: element.users.filter((v) => v == user)[0],
              message: element.messageList.filter((v, index) => index === element.messageList.length - 1)[0],
            });
            return result;
          }, []),
        }),
      );
    } catch (err) {
      res.json(basicResponse('가져오는 중 에러가 발생하였습니다.'));
    }
  },
  loadDetail: async (req, res) => {
    try {
      const { _id } = req.body;
      console.log(_id);
      const result = await Mail.findOne({ _id });
      res.json(resultResponse('성공적으로 가져왔습니다.', true, { data: result.messageList }));
    } catch (err) {
      res.json(basicResponse('가져오는 중 에러가 발생하였습니다.' + err));
    }
  },
  save: async (req, res) => {
    try {
      const { _id, sender, message } = req.body;
      const result = await Mail.updateOne(
        { _id: ObjectId(_id) },
        { $push: { messageList: { sender, message, createAt: new Date() } } },
      );
      res.json(resultResponse('성공적으로 저장했습니다.', true, result));
    } catch (err) {
      res.json(basicResponse('저장하는 중 에러가 발생하였습니다.'));
    }
  },
};

module.exports = mail;

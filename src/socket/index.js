const SocketEvents = require('../type/index');
const Mail = require('../models/Mail');
const ObjectId = require('mongodb').ObjectID;
let roomList = {};

const findUser = (_id, userId) => {
  roomList[_id].reduce((result, element, index) => {
    if (element === userId) result = index;
    return result;
  }, 0);
};

const getSocket = (socketIO) => {
  socketIO.on('connect', (socket) => {
    console.log('socket connect');

    socket.on(SocketEvents.makeRoom, (_id, done) => {
      roomList[_id] = [];
      done({ status: 'SUCESS', message: '성공적으로 방을 만들었습니다.' });
    });

    socket.on(SocketEvents.joinRoom, (_id, userId, done) => {
      if (!roomList[_id]) roomList[_id] = [];
      if (roomList[_id]) {
        roomList[_id].push(userId);
        socket.join(_id);
        done({ status: 'SUCESS', message: '성공적으로 방에 들어왔습니다.' });
      } else {
        done({ status: 'FAILED' });
      }
    });
    socket.on(SocketEvents.leaveRoom, (_id, userId, done) => {
      if (roomList[_id]) {
        socket.leave(_id);
        roomList.pop(findUser(_id, userId));
        done({ status: 'SUCESS', message: '성공적으로 방을 떠났습니다.' });
      } else {
        done({ status: 'FAILED', message: '오류가 있습니다.' });
      }
    });

    socket.on(SocketEvents.sendMessage, async (_id, userId, message, to) => {
      try {
        const result = await Mail.updateOne(
          { _id: ObjectId(_id) },
          { $push: { messageList: { sender: userId, message, createAt: new Date() } } },
        );
        console.log('success', result);
        if (result.nModified === 0) {
          console.log('이미있다');
          const newMail = new Mail({
            users: [userId, to],
            messageList: [{ sender: userId, message, createAt: new Date() }],
          });
          const temp = await newMail.save();
          console.log(temp);
          socket.join(temp._id);
          socketIO.to(temp._id).emit(SocketEvents.receiveMessage, { sender: userId, message, createAt: new Date() });
        } else {
          socketIO.to(_id).emit(SocketEvents.receiveMessage, { sender: userId, message, createAt: new Date() });
        }
      } catch (err) {}
    });
  });
};

module.exports = { getSocket };

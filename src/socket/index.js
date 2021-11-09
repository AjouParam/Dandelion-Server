const SocketEvents = require('../type/index');
const io = require('socket.io');

const socketIO = io();
let roomList = {};

const findUser = (_id, userId) => {
  roomList[_id].reduce((result, element, index) => {
    if (element === userId) result = index;
    return result;
  }, 0);
};

socketIO.on('connect', (socket) => {
  console.log('socket connect');

  socket.on(SocketEvents.makeRoom, (_id, done) => {
    roomList[_id] = [];
    done({ status: 'SUCESS', message: '성공적으로 방을 만들었습니다.' });
  });

  socket.on(SocketEvents.joinRoom, (_id, userId, done) => {
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

  socket.on(SocketEvents.sendMessage, (_id, userId, message) => {
    io.to(_id).emit(SocketEvents.receiveMessage, { userId, message });
  });
});

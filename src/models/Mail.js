const mongoose = require('mongoose');
const { getKoreanTime } = require('../routes/provider/util');
const Schema = mongoose.Schema;

const MailSchema = new Schema({
  users: [],
  messageList: [],
  createdAt: {
    type: Date,
    default: getKoreanTime(),
  },
});

const Mail = mongoose.model('Mail', MailSchema);

module.exports = Mail;

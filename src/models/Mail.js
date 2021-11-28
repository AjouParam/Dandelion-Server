const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MailSchema = new Schema({
  users: [],
  messageList: [],
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

const Mail = mongoose.model('Mail', MailSchema);

module.exports = Mail;

const nodemailer = require('nodemailer');

module.exports = Verify = {
  // 메일발송 함수
  sendGmail: function (param) {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      prot: 587,
      host: 'smtp.gmlail.com',
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
      },
    });
    // 메일 옵션
    let mailOptions = {
      from: process.env.NODEMAILER_USER,
      to: param.toEmail, // 수신할 이메일
      subject: param.subject, // 메일 제목
      text: param.text, // 메일 내용
    };
    // 메일 발송
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  },
};

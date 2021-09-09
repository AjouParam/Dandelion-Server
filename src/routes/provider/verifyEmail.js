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
      html: `<h1 style="color: #5e9ca0;">안녕하세요! <span style="color: #2b2301;">test_Jang님</span> 민들레 입니다!</h1>
      <h2 >추억을 기록하고 공유하는 소셜 네트워크 서비스 <span style="color: #5e9ca0;">민들레</span></h2>
      <p>비밀번호 변경을 위한 인증코드 입니다.<br />절대 다른 사람에게 귀하의 인증 코드를 공개하지 마십시오.</p>
      <p><h2 style="color: #2e6c80;">인증 코드</h2>
      <span style="background-color: #2b2301; color: #fff; display: inline-block; padding: 3px 10px; font-weight: bold; border-radius: 5px;">
      ${param.text}</span> 입니다.`,
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

const nodemailer = require('nodemailer');

async function test() {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "credbacknoti@gmail.com",
      pass: "btkciwqulosizbjs",
    },
  });

  try {
    let info = await transporter.sendMail({
      from: '"Test Sender" <credbacknoti@gmail.com>',
      to: "credbacknoti@gmail.com",
      subject: "Test Mạng Mới",
      text: "Mạng mới đã kết nối thành công SMTP",
    });
    console.log("Message sent: %s", info.messageId);
  } catch(e) {
    console.log("Error:", e);
  }
}

test();

const nodemailer = require("nodemailer");

const host = "smtp.mailtrap.io";
const port = 2525;
const user = "1308639fb52621";
const pass = "c29ce1ee2fea28";

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host,
    port,
    auth: {
      user,
      pass,
    },
  });

  const mailOptions = {
    from: "Praveen Nagaraj <praveen@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;

const nodemailer = require("nodemailer");
const POOL_DEDUCTION = 0.7;
function generateOTP() {
  const digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < 6; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}
async function sendOTPtoEmail(email, otp) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "ethereumproject1234@gmail.com",
      pass: "fdaqreyfzuqbyjmx",
    },
  });

  const mailOptions = {
    from: "ethereumproject1234@gmail.com",
    to: email,
    subject: "Password Reset OTP",
    text: `Your OTP for password reset is: ${otp}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

module.exports = {
  POOL_DEDUCTION,
  generateOTP,
  sendOTPtoEmail,
};

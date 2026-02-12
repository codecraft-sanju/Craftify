// backend/utils/sendEmail.js
const nodemailer = require("nodemailer");

const sendEmailOtp = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "vaishnavlibrary18@gmail.com", // Aapki Gmail ID
        pass: "bedn wcgp kfaf ndq",          // 16-Digit App Password (Google Account -> Security -> App Passwords)
      },
    });

    const mailOptions = {
      from: '"Giftomize Security" <sanjaychoudhury693@gmail.com>',
      to: email,
      subject: `${otp} is your verification code`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; text-align: center; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #4F46E5;">Giftomize</h2>
          <p>Please use the code below to verify your account:</p>
          <h1 style="background: #f3f4f6; padding: 10px 20px; display: inline-block; letter-spacing: 5px; border-radius: 8px;">${otp}</h1>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">This code expires in 10 minutes.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Email Send Error:", error.message);
    return false;
  }
};

module.exports = sendEmailOtp;
const nodemailer = require("nodemailer");

const sendEmailOtp = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,        // <-- FIX 1: 465 ki jagah 587 (Yeh block nahi hota)
      secure: false,    // <-- FIX 2: 587 ke liye yeh FALSE hona zaroori hai
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      family: 4 // IPv4 Force abhi bhi rakho, yeh zaroori hai
    });

    const mailOptions = {
      from: `"Giftomize Security" <${process.env.EMAIL_USER}>`, 
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
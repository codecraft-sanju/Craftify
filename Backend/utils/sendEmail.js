// backend/utils/sendEmail.js
const nodemailer = require("nodemailer");

const sendEmailOtp = async (email, otp) => {
  
  // Mail ka content same rahega dono attempts ke liye
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

  // Helper function: Transporter banane ke liye
  // agar 'forceIPv4' true hai toh family: 4 use karega
  const createTransporter = (forceIPv4) => {
    return nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      family: forceIPv4 ? 4 : undefined // Yahan magic hai
    });
  };

  try {
    // --- ATTEMPT 1: Normal Connection (IPv6/Default) ---
    // Pehle bina kisi setting ke try karega (Fastest method)
    const transporter = createTransporter(false);
    await transporter.sendMail(mailOptions);
    
    console.log(`✅ Email OTP sent to ${email} (via Standard Route)`);
    return true;

  } catch (error) {
    
    // Agar Network Error aaya (IPv6 issue), toh Catch block chalega
    console.warn("⚠️ Standard email failed. Retrying with IPv4 Force...", error.code);

    // Sirf network errors pe retry karo
    if (error.code === 'ENETUNREACH' || error.code === 'ETIMEDOUT' || error.code === 'ESOCKETTIMEDOUT') {
      try {
        // --- ATTEMPT 2: Force IPv4 ---
        // Ab hum specifically IPv4 wala transporter bana ke bhejenge
        const transporterv4 = createTransporter(true);
        await transporterv4.sendMail(mailOptions);
        
        console.log(`✅ Email OTP sent to ${email} (via IPv4 Backup)`);
        return true;
      } catch (retryError) {
        // Agar IPv4 bhi fail ho gaya, toh sach mein koi issue hai
        console.error("❌ IPv4 Retry also failed:", retryError.message);
        return false;
      }
    } else {
      // Agar error password ya user not found ka hai, toh retry mat karo
      console.error("❌ Email Send Error:", error.message);
      return false;
    }
  }
};

module.exports = sendEmailOtp;
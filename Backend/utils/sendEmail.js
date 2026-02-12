const nodemailer = require("nodemailer");

const sendEmailOtp = async (email, otp) => {
  try {
    // 1. --- DEBUGGING LOGS (Render Logs mein check karna) ---
    // Hum password print nahi karenge, bas check karenge ki loaded hai ya nahi
    console.log("📧 Attempting to send email...");
    console.log("   > User:", process.env.EMAIL_USER ? `Present (${process.env.EMAIL_USER})` : "❌ MISSING in .env");
    console.log("   > Pass:", process.env.EMAIL_PASS ? "✅ Present (Hidden)" : "❌ MISSING in .env");

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("Email credentials missing in Environment Variables");
    }

    // 2. --- TRANSPORTER CONFIG (Secure Port 465) ---
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", // Explicit host better hai
      port: 465,              // SSL Port (Cloud friendly)
      secure: true,           // True for 465
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // Timeout settings taaki request hang na ho
      connectionTimeout: 10000, 
      greetingTimeout: 5000,
    });

    const mailOptions = {
      from: `"Giftomize Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `${otp} is your verification code`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; text-align: center; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #4F46E5;">Giftomize</h2>
          <p>Please use the code below to verify your account:</p>
          <h1 style="background: #f3f4f6; padding: 10px 20px; display: inline-block; letter-spacing: 5px; border-radius: 8px; color: #000;">${otp}</h1>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">This code expires in 10 minutes.</p>
        </div>
      `,
    };

    // 3. --- VERIFY CONNECTION BEFORE SENDING ---
    await transporter.verify(); 
    console.log("✅ SMTP Connection Verified");

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email OTP sent successfully to ${email}`);
    return true;

  } catch (error) {
    console.error("❌ Email Send Error Details:", error.message);
    
    // Agar authentication error hai, toh hint do
    if(error.message.includes("Username and Password not accepted")) {
        console.error("💡 HINT: Check if you are using the 'App Password' (16 digits) and not your Gmail login password.");
    }
    
    return false;
  }
};

module.exports = sendEmailOtp;
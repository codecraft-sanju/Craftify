const nodemailer = require("nodemailer");
const dns = require("dns");

// 🔥 FIX 1: Zabardasti IPv4 use karne ka global order set kar rahe hain
// Isse wo IPv6 (:::0) wala error kabhi nahi aayega.
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (error) {
  // Agar purana Node version hai toh ignore karega, par naye versions me yeh fix hai
  console.log("Could not set IPv4 preference, continuing...");
}

const sendEmailOtp = async (email, otp) => {
  let attempt = 1;
  const maxRetries = 3; // 3 baar koshish karega agar fail hua toh

  // Loop chalayenge taaki agar ek baar fail ho toh dubara try kare
  while (attempt <= maxRetries) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail", // 'service: gmail' use karne se port/secure ki chinta nahi karni padti
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false, // Localhost errors ko rokne ke liye
        },
        // 🔥 FIX 2: Connection settings me bhi IPv4 force kar rahe hain
        family: 4, 
      });

      const mailOptions = {
        from: `"Giftomize Security" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `${otp} is your verification code`,
        html: `
        <div style="font-family: sans-serif; padding: 20px; text-align: center; border: 1px solid #eee; border-radius: 10px; max-width: 400px; margin: auto;">
          <h2 style="color: #4F46E5;">Giftomize</h2>
          <p style="color: #333;">Please use the code below to verify your account:</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1f2937;">${otp}</span>
          </div>
          <p style="color: #666; font-size: 12px;">This code expires in 10 minutes.</p>
        </div>
      `,
      };

      // Mail send karne ki koshish
      await transporter.sendMail(mailOptions);
      console.log(`✅ Email OTP sent successfully to ${email}`);
      return true; // Agar success ho gaya, toh yahin se return true karke nikal jayega

    } catch (error) {
      console.error(`⚠️ Attempt ${attempt} failed: ${error.message}`);
      
      if (attempt === maxRetries) {
        console.error(`❌ Final Error: Could not send email to ${email} after ${maxRetries} attempts.`);
        return false;
      }
      
      // Thoda wait karte hain agle try se pehle (1 second)
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempt++;
    }
  }
};

module.exports = sendEmailOtp;
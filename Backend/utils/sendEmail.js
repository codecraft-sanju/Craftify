const nodemailer = require("nodemailer");
const dns = require("dns");

// --- DNS FIX: Force IPv4 ---
// Yeh line bahut zaroori hai taaki 'ENETUNREACH' (IPv6) error na aaye
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (error) {
  console.log("IPv4 preference setting skipped (older Node version).");
}

const sendEmailOtp = async (email, otp) => {
  // Check: Agar credentials nahi hain toh turant ruk jao
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ Critical Error: EMAIL_USER or EMAIL_PASS missing in .env");
    return false;
  }

  // --- ENVIRONMENT CONFIGURATION ---
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Production ke liye strict settings, Development ke liye easy settings
  const transporterConfig = isProduction
    ? {
        // PRODUCTION SETTINGS (Cloud/Vercel/Render)
        host: "smtp.gmail.com",
        port: 465, // SSL Port (Cloud servers par sabse reliable)
        secure: true, // 465 ke liye True
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        family: 4, // Force IPv4
      }
    : {
        // DEVELOPMENT SETTINGS (Localhost)
        service: "gmail", // Google ka default behavior (Port 587)
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false, // Local SSL errors ignore karne ke liye
        },
        family: 4,
      };

  // --- RETRY LOGIC (3 Attempts) ---
  let attempt = 1;
  const maxRetries = 3;

  while (attempt <= maxRetries) {
    try {
      const transporter = nodemailer.createTransport(transporterConfig);

      // Verify connection before sending (Optional but good for debugging)
      if (attempt === 1) {
        await transporter.verify(); 
      }

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
          <p style="color: #9ca3af; font-size: 10px; margin-top: 20px;">
            Request from: ${isProduction ? 'Secure Server' : 'Development Server'}
          </p>
        </div>
      `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Email OTP sent to ${email} (Mode: ${isProduction ? 'Production' : 'Dev'})`);
      return true;

    } catch (error) {
      console.error(`⚠️ Attempt ${attempt} failed: ${error.message}`);
      
      if (attempt === maxRetries) {
        console.error(`❌ Final Failure: Could not send email to ${email}.`);
        return false;
      }
      
      // Wait 1.5 seconds before retry
      await new Promise(resolve => setTimeout(resolve, 1500));
      attempt++;
    }
  }
};

module.exports = sendEmailOtp;
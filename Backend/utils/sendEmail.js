const nodemailer = require("nodemailer");
const dns = require("dns");

// --- DNS FIX: Force IPv4 ---
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (error) {
  console.log("IPv4 preference setting skipped.");
}

const sendEmailOtp = async (email, otp) => {
  // 1. PASSWORD CLEANER (Spaces hata dega agar galti se reh gaye)
  // Sabse important fix: Password ke spaces remove karna
  const cleanPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : '';

  if (!process.env.EMAIL_USER || !cleanPass) {
    console.error("❌ Critical: EMAIL_USER or EMAIL_PASS missing.");
    return false;
  }

  const isProduction = process.env.NODE_ENV === 'production';
  
  // 2. FIXED CONFIGURATION (Force Port 587 for Render/Cloud)
  // Hum 'service: gmail' HATA rahe hain taaki hum manually Port 587 set kar sakein
  const transporterConfig = {
    host: "smtp.gmail.com",
    port: 587,            // <--- Cloud Servers ke liye best port (465 block hota hai)
    secure: false,        // 587 ke liye false hi hona chahiye (STARTTLS use karega)
    auth: {
      user: process.env.EMAIL_USER,
      pass: cleanPass,    // Cleaned password use karega
    },
    tls: {
      ciphers: "SSLv3",
      rejectUnauthorized: false // Thoda less secure but highly compatible fix
    },
    // Debugging on rakhi hai taaki hum dekh sakein kya ho raha hai
    logger: true,
    debug: true,
  };

  let attempt = 1;
  const maxRetries = 3;

  while (attempt <= maxRetries) {
    try {
      console.log(`\n🔄 Attempt ${attempt} (Port 587)...`);
      const transporter = nodemailer.createTransport(transporterConfig);

      if (attempt === 1) await transporter.verify(); 

      const mailOptions = {
        from: `"Giftomize Security" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `${otp} is your verification code`,
        html: `
        <div style="font-family: sans-serif; padding: 20px; text-align: center; border: 1px solid #eee; border-radius: 10px; max-width: 400px; margin: auto;">
          <h2 style="color: #4F46E5;">Giftomize</h2>
          <p style="color: #333;">Your verification code is:</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1f2937;">${otp}</span>
          </div>
          <p style="color: #9ca3af; font-size: 10px;">Server: ${isProduction ? 'Cloud' : 'Local'}</p>
        </div>
      `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Email Sent to ${email}`);
      return true;

    } catch (error) {
      console.error(`⚠️ Attempt ${attempt} Failed: ${error.message}`);
      
      if (attempt === maxRetries) {
        console.error("❌ Final Failure.");
        return false;
      }
      // Wait 2 seconds before retry
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempt++;
    }
  }
};

module.exports = sendEmailOtp;
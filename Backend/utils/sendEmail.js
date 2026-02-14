const nodemailer = require("nodemailer");
const dns = require("dns");

// --- HELPER: Manually Resolve Gmail IP (IPv4 Only) ---
// Render ka server IPv6 force karta hai, isliye hum manually IPv4 nikalenge
const getGmailIp = async () => {
  return new Promise((resolve) => {
    dns.resolve4('smtp.gmail.com', (err, addresses) => {
      if (err || !addresses || addresses.length === 0) {
        console.warn("⚠️ DNS Resolve Failed, using domain name fallback.");
        resolve('smtp.gmail.com'); 
      } else {
        resolve(addresses[0]); // Pehla IPv4 address utha lo
      }
    });
  });
};

const sendEmailOtp = async (email, otp) => {
  // 1. Password Cleaner
  const cleanPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : '';

  if (!process.env.EMAIL_USER || !cleanPass) {
    console.error("❌ Critical: EMAIL_USER or EMAIL_PASS missing.");
    return false;
  }

  // 2. IP ADDRESS RESOLUTION (The Fix)
  const gmailHost = await getGmailIp();
  console.log(`🔍 Resolved SMTP Host: ${gmailHost} (Using this to bypass IPv6)`);

  const transporterConfig = {
    host: gmailHost,      // <--- Yahan hum Domain nahi, seedha IP use kar rahe hain
    port: 465,            // SSL Port
    secure: true,         // True for 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: cleanPass,
    },
    // SSL Certificate Fix (Kyunki hum IP use kar rahe hain, hamein servername batana padega)
    tls: {
      servername: 'smtp.gmail.com', 
      rejectUnauthorized: false 
    },
    // Timeouts
    connectionTimeout: 10000, 
    greetingTimeout: 5000,
    socketTimeout: 10000
  };

  let attempt = 1;
  const maxRetries = 3;

  while (attempt <= maxRetries) {
    try {
      console.log(`\n🔄 Attempt ${attempt} (Connecting to ${gmailHost})...`);
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
          <p style="color: #9ca3af; font-size: 10px;">Valid for 10 minutes.</p>
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempt++;
    }
  }
};

module.exports = sendEmailOtp;
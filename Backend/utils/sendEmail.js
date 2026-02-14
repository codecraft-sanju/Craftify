const nodemailer = require("nodemailer");

const sendEmailOtp = async (email, otp) => {
  // 1. Password Cleaner (Spaces remove karega)
  // Yeh ensure karta hai ki .env password me koi galti se space na reh jaye
  const cleanPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : '';

  if (!process.env.EMAIL_USER || !cleanPass) {
    console.error("❌ Critical: EMAIL_USER or EMAIL_PASS missing.");
    return false;
  }

  const isProduction = process.env.NODE_ENV === 'production';
  
  // 2. FIXED CONFIGURATION (Port 465 SSL + Force IPv4)
  const transporterConfig = {
    host: "smtp.gmail.com",
    port: 465,            // SSL Port (Cloud Servers ke liye best)
    secure: true,         // 465 ke liye TRUE hona zaroori hai
    auth: {
      user: process.env.EMAIL_USER,
      pass: cleanPass,
    },
    // --- CRITICAL FIX: FORCE IPv4 ---
    family: 4,            // <--- Yeh line 'ENETUNREACH' IPv6 error ko rokegi
    // --------------------------------
    tls: {
      rejectUnauthorized: false // Handshake errors avoid karne ke liye
    },
    // Timeouts (Taaki server hang na ho)
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 5000,
    socketTimeout: 10000
  };

  let attempt = 1;
  const maxRetries = 3;

  while (attempt <= maxRetries) {
    try {
      console.log(`\n🔄 Attempt ${attempt} (Port 465, Force IPv4)...`);
      const transporter = nodemailer.createTransport(transporterConfig);

      // Pehli baar connection verify karo
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
      // 2 second wait karo phir retry karo
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempt++;
    }
  }
};

module.exports = sendEmailOtp;
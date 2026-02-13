const nodemailer = require("nodemailer");
const dns = require("dns");

// --- DNS FIX: Force IPv4 ---
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (error) {
  console.log("IPv4 preference setting skipped (older Node version).");
}

const sendEmailOtp = async (email, otp) => {
  console.log("\n--- 📧 EMAIL DEBUG START ---");
  console.log(`Target Email: ${email}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // 1. CHECK ENV VARIABLES (Password print nahi karenge, bas length check karenge)
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ Critical Error: EMAIL_USER or EMAIL_PASS missing in .env");
    console.log("EMAIL_USER Present:", !!process.env.EMAIL_USER);
    console.log("EMAIL_PASS Present:", !!process.env.EMAIL_PASS);
    return false;
  }

  console.log(`Sender: ${process.env.EMAIL_USER}`);
  console.log(`Pass Length: ${process.env.EMAIL_PASS.length} (Should be 16 for App Password)`);

  const isProduction = process.env.NODE_ENV === 'production';
  
  // 2. CONFIGURATION WITH DEBUGGING ENABLED
  const transporterConfig = isProduction
    ? {
        // PRODUCTION SETTINGS
        service: "gmail", 
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        // --- DEBUGGING FLAGS ---
        logger: true, // Console me poora SMTP log print karega
        debug: true,  // Connection details include karega
      }
    : {
        // DEVELOPMENT SETTINGS
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false, 
        },
        logger: true, // Dev me bhi logs dikhao
        debug: true,
      };

  let attempt = 1;
  const maxRetries = 3;

  while (attempt <= maxRetries) {
    try {
      console.log(`\n🔄 Attempt ${attempt} of ${maxRetries}...`);
      const transporter = nodemailer.createTransport(transporterConfig);

      // 3. VERIFY CONNECTION (Detailed Error Catching)
      if (attempt === 1) {
        console.log("Testing SMTP Connection...");
        await transporter.verify(); 
        console.log("✅ SMTP Connection Verified!");
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

      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Email Sent Successfully! Message ID: ${info.messageId}`);
      console.log("--- 📧 EMAIL DEBUG END ---\n");
      return true;

    } catch (error) {
      console.error(`⚠️ Attempt ${attempt} FAILED.`);
      
      // 4. PRINT DETAILED ERROR
      console.error("--- ERROR DETAILS ---");
      console.error("Error Code:", error.code);     // e.g., EAUTH, ETIMEDOUT
      console.error("Error Command:", error.command); // e.g., CONN, AUTH
      console.error("Error Response:", error.response); // Google se kya jawab aaya
      console.error("Full Message:", error.message);
      console.error("---------------------");

      if (attempt === maxRetries) {
        console.error(`❌ Final Failure: Giving up on ${email}.`);
        return false;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      attempt++;
    }
  }
};

module.exports = sendEmailOtp;
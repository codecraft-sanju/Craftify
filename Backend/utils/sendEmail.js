const nodemailer = require("nodemailer");
const dns = require("dns");

// --- 🛡️ DNS HACK: Force IPv4 (Isse rehne do, ye zaroori hai) ---
const originalLookup = dns.lookup;
dns.lookup = (hostname, options, callback) => {
    if (typeof options === 'function') {
        callback = options;
        options = {};
    }
    options = options || {};
    options.family = 4; // Force IPv4
    return originalLookup(hostname, options, callback);
};

const sendEmailOtp = async (email, otp) => {
    // 1. Password Cleaner
    const cleanPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : '';

    if (!process.env.EMAIL_USER || !cleanPass) {
        console.error("❌ Critical: EMAIL_USER or EMAIL_PASS missing.");
        return false;
    }

    // --- 2. NEW STRATEGY: GOOGLEMAIL DOMAIN + POOLING ---
    // Hum 'service: gmail' hata rahe hain aur manual config kar rahe hain.
    const transporter = nodemailer.createTransport({
        host: 'smtp.googlemail.com', // <--- MAGIC CHANGE: Old Google Domain
        port: 465,                   // SSL Port
        secure: true,                // True for 465
        auth: {
            user: process.env.EMAIL_USER,
            pass: cleanPass,
        },
        pool: true,          // <--- CONNECTION POOLING ON (Keeps connection alive)
        maxConnections: 1,   // Sirf 1 connection maintain karo
        rateLimit: 1,        // Dheere bhejo
        tls: {
            rejectUnauthorized: false
        },
        // Timeouts
        connectionTimeout: 10000, 
        greetingTimeout: 10000,
        socketTimeout: 10000
    });

    try {
        console.log(`\n🔄 Connecting to smtp.googlemail.com (Pooled)...`);
        
        // Verify connection status
        await transporter.verify();
        console.log("✅ Server is ready to take our messages");

        const mailOptions = {
            from: `"Giftomize" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Your OTP is ${otp}`,
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
        console.log(`✅ Email Sent Successfully to ${email}`);
        return true;

    } catch (error) {
        console.error(`❌ Email Failed: ${error.message}`);
        return false;
    }
};

module.exports = sendEmailOtp;
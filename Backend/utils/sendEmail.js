const nodemailer = require("nodemailer");
const dns = require("dns");

// --- 🛡️ NUCLEAR IPv6 BLOCKER (Global Fix) ---
// Render ka server IPv6 use karne ki koshish karta hai jo fail hota hai.
// Hum Node.js ka 'lookup' function hi badal rahe hain taaki woh HAMESHA IPv4 return kare.
const originalLookup = dns.lookup;
dns.lookup = (hostname, options, callback) => {
    if (typeof options === 'function') {
        callback = options;
        options = {};
    }
    options = options || {};
    options.family = 4; // <--- FORCE IPv4 GLOBALLY
    return originalLookup(hostname, options, callback);
};

const sendEmailOtp = async (email, otp) => {
    // 1. Password Cleaner
    const cleanPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : '';

    if (!process.env.EMAIL_USER || !cleanPass) {
        console.error("❌ Critical: EMAIL_USER or EMAIL_PASS missing.");
        return false;
    }

    // 2. STANDARD GMAIL CONFIG (With Global IPv4 Fix)
    // Hum 'service: gmail' wapas use kar rahe hain kyunki ye Google ke saath best handshake karta hai.
    // Upar wala 'DNS Hack' ensure karega ki ye IPv6 use na kare.
    const transporter = nodemailer.createTransport({
        service: 'gmail', // <--- Auto-configures Host & Ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: cleanPass,
        },
        // Handshake fix
        tls: {
            rejectUnauthorized: false 
        },
        // Timeouts badha diye
        connectionTimeout: 20000, 
        greetingTimeout: 20000,
        socketTimeout: 20000
    });

    try {
        console.log(`\n🔄 Sending Email via Gmail Service (Force IPv4)...`);
        
        // Connection Check
        await transporter.verify();
        console.log("✅ Connection Verified!");

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
        console.log(`✅ Email Sent Successfully to ${email}`);
        return true;

    } catch (error) {
        console.error(`❌ Email Failed: ${error.message}`);
        return false;
    }
};

module.exports = sendEmailOtp;
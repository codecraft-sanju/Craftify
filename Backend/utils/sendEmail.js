const nodemailer = require("nodemailer");

// Reusable Email OTP Sender Function
const sendEmailOtp = async (toEmail, otp) => {
    try {
        // .env se credentials
        const EMAIL_USER = process.env.EMAIL_USER;
        const EMAIL_PASS = process.env.EMAIL_PASS;

        if (!EMAIL_USER || !EMAIL_PASS) {
            console.error("❌ Email credentials missing in .env");
            return false;
        }

        // Transporter create karo
     const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true sirf 465 ke liye hota hai
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
    family: 4 // 🔥 IPv4 force karega (main fix)
});

        // Mail template
        const mailOptions = {
            from: `"Giftomize 🎁" <${EMAIL_USER}>`,
            to: toEmail,
            subject: "Your OTP Code - Giftomize",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color:#4f46e5;">Welcome to Giftomize 🎁</h2>
                    <p>Your One-Time Password (OTP) is:</p>
                    
                    <h1 style="
                        background:#f3f4f6;
                        padding:15px;
                        letter-spacing:5px;
                        display:inline-block;
                        border-radius:8px;
                        color:#111827;
                    ">
                        ${otp}
                    </h1>
                    
                    <p>This OTP is valid for <strong>10 minutes</strong>.</p>
                    <p style="color:red;">Do not share this code with anyone.</p>

                    <br/>
                    <p>– Team Giftomize 🚀</p>
                </div>
            `,
        };

        // Send mail
        await transporter.sendMail(mailOptions);

        console.log(`✅ Email OTP Sent to ${toEmail}`);
        return true;

    } catch (error) {
        console.error("❌ Email Send Failed:", error.message);
        return false;
    }
};

module.exports = sendEmailOtp;

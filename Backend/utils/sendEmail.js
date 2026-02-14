const nodemailer = require("nodemailer");

// Reusable Email OTP Sender Function
const sendEmailOtp = async (toEmail, otp) => {
    try {
        // .env se credential
        const BREVO_USER = process.env.BREVO_USER;
        const BREVO_PASS = process.env.BREVO_PASS;

        if (!BREVO_USER || !BREVO_PASS) {
            console.error("❌ Brevo SMTP credentials missing in .env");
            return false;
        }

        // Brevo SMTP Transporter
        const transporter = nodemailer.createTransport({
            host: "smtp-relay.brevo.com",
            port: 587,
            secure: false,
            auth: {
                user: BREVO_USER,
                pass: BREVO_PASS,
            },
        });

        // Mail template
        const mailOptions = {
            from: `"Giftomize 🎁" <${BREVO_USER}>`, 
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

        await transporter.sendMail(mailOptions);

        console.log(`✅ Email OTP Sent to ${toEmail}`);
        return true;

    } catch (error) {
        console.error("❌ Email Send Failed:", error.message);
        return false;
    }
};

module.exports = sendEmailOtp;

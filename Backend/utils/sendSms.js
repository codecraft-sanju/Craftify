// utils/sendSms.js
const axios = require('axios');

const sendSms = async (phone, msg) => {
    try {
        // --- CHANGES MADE: URL updated to /send-message, added '+' to phone, and added type parameter ---
        const response = await axios.post('http://13.233.83.235:3000/send-message', {
            apiKey: process.env.AIRTEXT_API_KEY,
            phone: `+${phone}`, // AirText/Baileys ke liye + lagana better practice hai
            msg: msg,
            type: 'sms', // 'sms', 'whatsapp', ya 'both' set kar sakte ho
            webhookUrl: process.env.WEBHOOK_URL
        });
        return response.data;
    } catch (error) {
        console.error("Airtext SMS Utility Error:", error.message);
        throw new Error("Failed to send SMS");
    }
};

module.exports = sendSms;
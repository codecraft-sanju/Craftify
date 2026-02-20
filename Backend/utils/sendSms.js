// utils/sendSms.js
const axios = require('axios');

const sendSms = async (phone, msg) => {
    try {
        const response = await axios.post('https://airtext-fo6q.onrender.com/send-sms', {
            apiKey: process.env.AIRTEXT_API_KEY,
            phone: phone,
            msg: msg,
            webhookUrl: process.env.WEBHOOK_URL
        });
        return response.data;
    } catch (error) {
        console.error("Airtext SMS Utility Error:", error.message);
        throw new Error("Failed to send SMS");
    }
};

module.exports = sendSms;
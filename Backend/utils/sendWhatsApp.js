// utils/sendWhatsApp.js
const axios = require('axios');

const sendWhatsApp = async (phone, msg) => {
    try {
        // --- CHANGES MADE: URL updated to /send-message, added '+' to phone, and added type parameter ---
        const response = await axios.post('https://airtext-fo6q.onrender.com/send-message', {
            apiKey: process.env.AIRTEXT_API_KEY,
            phone: `+${phone}`, // AirText/Baileys ke liye + lagana better practice hai
            msg: msg,
            type: 'whatsapp', // 'sms', 'whatsapp', ya 'both' set kar sakte ho
            webhookUrl: process.env.WEBHOOK_URL
        });
        return response.data;
    } catch (error) {
        console.error("Airtext WhatsApp Utility Error:", error.message);
        throw new Error("Failed to send whatsapp msg");
    }
};


module.exports = sendWhatsApp;
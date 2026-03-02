// utils/sendWhatsApp.js
const axios = require('axios');

const sendWhatsApp = async (phone, msg) => {
    try {
        // --- CHANGES MADE: URL protocol changed from https to http ---
        // Kyuki IP address 13.233.83.235 par SSL (HTTPS) active nahi hai
        const response = await axios.post('http://13.233.83.235:3000/send-message', {
            apiKey: process.env.AIRTEXT_API_KEY,
            phone: `+${phone}`, 
            msg: msg,
            type: 'whatsapp', 
            webhookUrl: process.env.WEBHOOK_URL
        });
        return response.data;
    } catch (error) {
        // Detailed logging for debugging
        console.error("Airtext WhatsApp Utility Error:", error.response ? error.response.data : error.message);
        throw new Error("Failed to send whatsapp msg");
    }
};

module.exports = sendWhatsApp;
// utils/sendWhatsApp.js
const axios = require('axios');

const sendWhatsApp = async (phone, msg) => {
    try {
        // --- CHANGES MADE: URL protocol changed from https to http ---
        // Kyuki IP address 13.233.83.235 par SSL (HTTPS) active nahi hai
        const response = await axios.post('http://13.233.83.235:3000/send-message', {
            apiKey:'9510ad40-9c45-4ac2-a03e-6ac71bd906e5',
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
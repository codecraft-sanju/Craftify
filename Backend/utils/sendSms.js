// utils/sendSms.js
const axios = require('axios');

const sendSms = async (phone, message) => {
    try {
        // AirText API Configuration
        const API_URL = 'https://airtext-fo6q.onrender.com/send-sms';
        const API_KEY = "92558fb3-07a6-4f1c-af7d-f45482659d04"; 

        if (!API_KEY) {
            console.error("❌ AirText API Key missing in .env");
            return false;
        }

        const response = await axios.post(API_URL, {
            apiKey: API_KEY,
            phone: phone,
            msg: message
        });

        if (response.data.success) {
            console.log(`✅ SMS Sent to ${phone}`);
            return true;
        } else {
            console.error(`❌ SMS Failed: ${response.data.message}`);
            return false;
        }

    } catch (error) {
        console.error("❌ SMS Network Error:", error.message);
        return false;
    }
};

module.exports = sendSms;
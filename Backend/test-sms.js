// test-sms.js
const axios = require('axios');

const API_URL = 'https://airtext-fo6q.onrender.com/send-sms';
const API_KEY = "80b7eede-4122-4b14-a2ed-de94f73b0db3"; 
const TO_PHONE = "+917568045830"; 
const MESSAGE = "Hello! This is a test messagrText API otp 098";
const WEBHOOK_URL = "https://webhook.site/test-url"; 

async function testSMS() {
    console.log("------------------------------------------------");
    console.log("🚀 STARTING SMS TEST...");
    console.log(`📡 Server URL: ${API_URL}`);
    console.log(`🔑 API Key:    ${API_KEY}`);
    console.log(`📱 Sending to: ${TO_PHONE}`);
    console.log(`🔗 Webhook:    ${WEBHOOK_URL}`);
    console.log("------------------------------------------------");

    try {
        console.log("⏳ Sending Request... (Instant response expected)");
        
        const response = await axios.post(API_URL, {
            apiKey: API_KEY,
            phone: TO_PHONE,
            msg: MESSAGE,
            webhookUrl: WEBHOOK_URL
        });

        console.log("\n✅ SERVER RESPONSE RECEIVED:");
        // Server ab 'messageId' bhi bhejta hai, wo check karo
        console.log("Status:", response.data.success ? "SUCCESS ✅" : "FAILED ❌");
        console.log("Message:", response.data.message);
        
        if(response.data.messageId) {
            console.log("🆔 Message ID (DB):", response.data.messageId);
        }
        
        console.log("\n💡 TIP: Check your Webhook URL for the final delivery report.");

    } catch (error) {
        console.log("\n❌ ERROR OCCURRED!");
        
        if (error.response) {
            // Server ne jawab diya par error status code ke sath
            console.log(`🔴 Status Code: ${error.response.status}`);
            console.log("🔴 Error Data:", error.response.data);
            
            if (error.response.status === 404) {
                console.log("\n💡 TIP: 'Device Offline' aa raha hai? Mobile App me 'Start Service' dabao.");
            }
            if (error.response.status === 401) {
                console.log("\n💡 TIP: 'Invalid API Key'? App se nayi key copy karo.");
            }
        } else if (error.request) {
            console.log("🔴 No response from server. Check internet or Server URL.");
        } else {
            console.log("🔴 Error Message:", error.message);
        }
    }
    console.log("------------------------------------------------");
}

testSMS();
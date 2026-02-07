// backend/utils/sendWhatsApp.js
const axios = require('axios');

const sendOrderConfirmation = async (order, user) => {
    try {
        // .env file se keys uthao
        const instanceId = process.env.WHATSAPP_INSTANCE_ID;
        const token = process.env.WHATSAPP_TOKEN;

        if (!instanceId || !token) {
            console.log("⚠️ WhatsApp keys missing in .env file");
            return;
        }

        // 1. Items ki list banao (Format: Name (Size) x Qty)
        const itemsList = order.items
            .map(item => `📦 ${item.name} ${item.selectedSize ? `(Size: ${item.selectedSize})` : ''} x ${item.qty}`)
            .join('\n');

        // 2. Message Format (Decorated with Emojis & Bold text)
        const message = `
🎉 *Order Confirmed!*

Hi *${user.name}*,
Thank you for shopping with *Giftomize*! We have received your order.

🆔 *Order ID:* ${order._id}
💰 *Total Amount:* ₹${order.totalAmount}
🚚 *Payment Method:* ${order.paymentInfo.method}

*Order Details:*
${itemsList}

-----------------------------
We will update you once your order is shipped.

Regards,
*Sanjay Choudhary (Founder)*
📞 +91 7568045830
        `.trim();

        // 3. Customer ka phone number formatting
        // WhatsApp API ko number bina '+' aur bina space ke chahiye (e.g., 919876543210)
        let phone = user.phone || order.shippingAddress.phone;
        
        // Non-numeric characters hatao
        phone = phone.replace(/\D/g, ''); 
        
        // Agar number 10 digit ka hai (e.g. 9876543210), toh aage 91 lagao
        if (phone.length === 10) {
            phone = "91" + phone;
        }

        // 4. API Call to UltraMsg
        const options = {
            method: 'POST',
            url: `https://api.ultramsg.com/${instanceId}/messages/chat`,
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            data: new URLSearchParams({
                token: token,
                to: phone,
                body: message
            })
        };

        await axios.request(options);
        console.log(`✅ WhatsApp sent to ${phone}`);
        return true;

    } catch (error) {
        // Agar message fail ho jaye, toh server crash nahi hona chahiye
        console.error("❌ WhatsApp Send Error:", error.message);
        return false;
    }
};

module.exports = sendOrderConfirmation;
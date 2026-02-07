const axios = require('axios');

const sendOrderConfirmation = async (order, user) => {
    try {
        const instanceId = process.env.WHATSAPP_INSTANCE_ID;
        const token = process.env.WHATSAPP_TOKEN;

        if (!instanceId || !token) {
            console.log("⚠️ WhatsApp keys missing in .env file");
            return;
        }

        // 1. Items List (Same as before)
        const itemsList = order.items
            .map(item => `📦 ${item.name} ${item.selectedSize ? `(Size: ${item.selectedSize})` : ''} x ${item.qty}`)
            .join('\n');

        // 2. Message Body (Decorated)
        const message = `
🎉 *Order Confirmed!*

Hi *${order.shippingAddress.fullName || user.name}*,
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

        // 3. Phone Number Logic (Priority: Shipping Address -> User Profile)
        let phone = order.shippingAddress.phone || user.phone;

        if (!phone) {
            console.log("❌ No phone number found for WhatsApp");
            return false;
        }
        
        // Formatting: Only numbers, remove spaces/dashes
        phone = phone.toString().replace(/\D/g, ''); 
        
        // India code check
        if (phone.length === 10) {
            phone = "91" + phone;
        }

        // --- 🔴 IMAGE LOGIC START (Yahan Change Hai) 🔴 ---
        
        // Check karo pehle item ki image hai ya nahi
        const productImage = order.items[0]?.image || order.items[0]?.coverImage;

        let apiUrl = `https://api.ultramsg.com/${instanceId}/messages/chat`;
        let payload = {
            token: token,
            to: phone,
            body: message // Text message ke liye 'body' use hota hai
        };

        // Agar Image mil gayi, toh API endpoint aur payload badal do
        if (productImage) {
            console.log("📸 Sending WhatsApp with Image...");
            apiUrl = `https://api.ultramsg.com/${instanceId}/messages/image`;
            payload = {
                token: token,
                to: phone,
                image: productImage, // Image URL
                caption: message     // Image ke sath text 'caption' ban jata hai
            };
        }
        // --- 🔴 IMAGE LOGIC END 🔴 ---

        // 4. Send API Request
        const options = {
            method: 'POST',
            url: apiUrl,
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            data: new URLSearchParams(payload)
        };

        await axios.request(options);
        console.log(`✅ WhatsApp sent to ${phone}`);
        return true;

    } catch (error) {
        console.error("❌ WhatsApp Send Error:", error.message);
        return false;
    }
};

module.exports = sendOrderConfirmation;
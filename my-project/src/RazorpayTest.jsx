import React from 'react';

const RazorpayTest = () => {
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      alert('Razorpay SDK failed to load. Are you online?');
      return;
    }

    try {
      const response = await fetch('https://api.giftomize.shop/create-order', { method: 'POST' });
      const order = await response.json();

      const options = {
        "key": "rzp_live_SKUDOOica8z6I6",
        "amount": order.amount,
        "currency": order.currency,
        "name": "Test Project",
        "description": "Testing Keys",
        "order_id": order.id,
        "handler": function (response){
          alert("Payment Successful! Payment ID: " + response.razorpay_payment_id);
        },
        "theme": {
          "color": "#3399cc"
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error(error);
      alert("Error creating order");
    }
  };

  return (
    <div style={{ padding: '50px', textAlign: 'center', backgroundColor: 'white', minHeight: '100vh' }}>
      <h2>Razorpay Key Test</h2>
      <button 
        onClick={handlePayment}
        style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#3399cc', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', marginTop: '10px' }}
      >
        Pay ₹1
      </button>
    </div>
  );
};

export default RazorpayTest;
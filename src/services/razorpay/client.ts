// Razorpay Client - Test keys (user will replace)
export const RAZORPAY_KEY_ID = 'rzp_test_1DPLFEjZ7q6z1q';
export const RAZORPAY_CONFIG = {
  key_id: RAZORPAY_KEY_ID,
  name: 'TrainerWebsite',
  theme: {
    color: '#10b981'
  }
};

// Load Razorpay script
export const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};


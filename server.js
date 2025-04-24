const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51RFYhnQh32oi3G5MnavJ9sd75oONjB8GrsUMMPJd6xURrtYllLRBbJLYyQ2CZF45rx0hVpDWrJCv7EozqT7DXZDz00zRg0FVQI', {
  apiVersion: '2023-10-16',
});

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173', // Allow requests from Vite frontend
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// Route to create Stripe Checkout session
app.post('/api/create-checkout-session', async (req, res) => {
  console.log('Received request to create checkout session:', req.body);
  try {
    const { amount, currency, description } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: description,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/stripePayment`,
    });

    res.status(200).json({ id: session.id });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

// Start the server
const PORT = process.env.PORT || 5550;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
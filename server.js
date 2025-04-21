// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const Stripe = require('stripe');

dotenv.config();

const app = express();
const port = 5550;

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());

// Create payment intent
app.post('/api/create-payment-intent', async (req, res) => {
  const { amount } = req.body;
  console.log('Received amount:', amount);
  console.log('Request body:', req.body);

  if (!amount) {
    return res.status(400).json({ error: 'Amount is required' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      payment_method_types: ['card'],
    });

    console.log('Payment Intent created:', paymentIntent);

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Stripe server running on http://localhost:${port}`);
});

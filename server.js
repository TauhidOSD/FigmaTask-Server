const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const Stripe = require('stripe');

dotenv.config();

const app = express();
const port = 5550;

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const JWT_SECRET = process.env.JWT_SECRET;
const SECRET = process.env.SECRET;

app.use(cors());
app.use(express.json());

function authenticateToken(req, res, next) {
//   const authHeader = req.headers['secret'];
//   const token = authHeader && authHeader.split(' ')[1];

  if (!SECRET) return res.status(401).json({ error: 'Missing secret' });

//   jwt.verify(token, JWT_SECRET, (err, user) => {
//     console.log(JWT_SECRET)
//     console.log(err)
//     if (err) return res.status(403).json({ error: 'Invalid token' });
//     req.user = user;
//     next();
//   });
}

app.post('/api/create-checkout-session', async (req, res) => {
  const { productName, amount, quantity } = req.body;

  if (!productName || !amount || !quantity) {
    return res.status(400).json({ error: 'Missing product info' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: productName },
            unit_amount: Math.round(amount * 100),
          },
          quantity,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:5173/success',
      cancel_url: 'http://localhost:5173/cancel',
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Stripe error:', error.message);
    res.status(500).json({ error: 'Payment session creation failed' });
  }
});

app.post('/api/login', (req, res) => {
  const user = { id: 1, email: 'user@example.com' };
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});

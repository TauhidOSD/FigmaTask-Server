const express = require("express");
const Stripe = require("stripe");
const cors = require("cors");
require("dotenv").config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "https://younitech.nl",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use("/webhook", express.raw({ type: "application/json" }));

// Health check
app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));

// Create checkout session
app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const { productData, currency, userData } = req.body;
    if (!productData?.name || !productData?.price) {
      return res.status(400).json({ error: "Missing product information" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card","ideal"],
      line_items: [
        {
          price_data: {
            currency: currency || "eur",
            product_data: {
              name: productData.name,
              description: productData.description,
            },
            unit_amount: productData.price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.origin}/payment?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/payment?canceled=true`,
      metadata: {
        userId: userData?.userId?.toString() || "0",
        name: userData?.name || "",
        postcode: userData?.postcode || "",
        city: userData?.city || "",
      },
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error("Checkout session error:", error);
    res.status(500).json({ error: error.message });
  }
});



// Webhook handler
app.post("/webhook", async (req, res) => {
  try {
    const event = stripe.webhooks.constructEvent(req.body, req.headers["stripe-signature"], process.env.STRIPE_WEBHOOK_SECRET);
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      // Handle successful payment (e.g., update database)
    }
    res.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(400).json({ error: error.message });
  }
});

// Check payment status
app.get("/api/check-payment-status/:sessionId", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    res.json({
      status: session.payment_status,
      customer: session.customer_details,
      metadata: session.metadata,
    });
  } catch (error) {
    console.error("Payment status error:", error);
    res.status(500).json({ error: error.message });
  }
});






// Start server
const PORT = process.env.PORT || 5550;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
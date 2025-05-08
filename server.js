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
    origin: ["https://younitech.nl", "http://localhost:5173"],
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
    // console.log(req.body);
    const { productData, currency, userData, productId } = req.body;

    if (!productData?.name || !productData?.price) {
      return res.status(400).json({ error: "Missing product information" });
    }

    // Get the current URL path parts from origin header
    const originUrl = req.headers.origin;
    const referer = req.headers.referer;

    // Extract product ID from referer URL or use provided productId
    let id = productId;
    if (!id && referer) {
      const urlParts = referer.split('/');
      id = urlParts[urlParts.length - 1];
    }

    // Default to ID 1 if we still don't have an ID
    if (!id || isNaN(parseInt(id))) {
      id = "1";
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "ideal"],
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
      // Include product ID in success and cancel URLs
      success_url: `${originUrl}/payment/${id}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${originUrl}/payment/${id}?canceled=true`,
      metadata: {
        userId: userData?.userId?.toString() || "0",
        name: userData?.name || "",
        postcode: userData?.postcode || "",
        city: userData?.city || "",
        productId: id, // Store product ID in metadata too
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
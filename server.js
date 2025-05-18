const express = require("express");
const Stripe = require("stripe");
const cors = require("cors");
require("dotenv").config();
const jwt = require('jsonwebtoken');

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
    //  console.log(req.body);

    const { productData, currency, userData, productId, oneTimePrice } = req.body;

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

    console.log(req.body,oneTimePrice);

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




// // // Forms value and admin login

// // //shakibhasan1070
// // //FovSrV62QKHdbWUm


const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

// Hardcoded admin credentials
const ADMIN = {
  email: process.env.ADMIN_EMAIL || 'admin@example.com',
  password: process.env.ADMIN_PASSWORD || 'admin123'
};


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://shakibhasan1070:FovSrV62QKHdbWUm@cluster0.cjeh8kh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db("userDB");
    const usersCollection = database.collection("users");
    const formsCollection = database.collection("forms");
    const paymentCollection = database.collection("payment");
    const maatwerkCollection = database.collection("maatwerk");
    const customCollection = database.collection("custom");

    app.post('/users',async(req,res)=>{
        const user =req.body;
        console.log('New user',user);
        const result =await usersCollection.insertOne(user);
        res.send(result);
    })


    app.get('/users',async(req,res)=>{
        const cursor =usersCollection.find();
        const result =await cursor.toArray();
        res.send(result);
    })


    app.post('/forms',async(req,res)=>{
        const form = req.body;
        console.log('Second user',form);
        const result =await formsCollection.insertOne(form);
        console.log(result);
        res.send(result);
    })

    app.get('/forms',async(req,res)=>{
      const cursor =formsCollection.find();
      const result =await cursor.toArray();
      res.send(result);
  })


    app.post('/payment',async(req,res)=>{
        const payment = req.body;
        console.log(payment);
        const result =await paymentCollection.insertOne(payment);
        res.send(result);
    })


    
    app.post('/maatwerk',async(req,res)=>{
        const maatwerk = req.body;
        console.log(maatwerk);
        const result =await maatwerkCollection.insertOne(maatwerk);
        res.send(result);
    })

    app.get('/maatwerk',async(req,res)=>{
      const cursor =maatwerkCollection.find();
      const result =await cursor.toArray();
      res.send(result);
  })


    app.post('/custom',async(req,res)=>{
        const custom= req.body;
        console.log(custom);
        const result =await customCollection.insertOne(custom);
        res.send(result);
    })

    app.get('/custom',async(req,res)=>{
      const cursor =customCollection.find();
      const result =await cursor.toArray();
      res.send(result);
  })


    // Admin login route
    app.post('http://localhost:5173/admin-login', (req, res) => {
      const { email, password } = req.body;

      if (email === ADMIN.email && password === ADMIN.password) {
        const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '2h' });
        return res.json({ token });
      }

      res.status(401).json({ message: 'Invalid credentials' });
    });


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



// Start server
const PORT = process.env.PORT || 5550;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
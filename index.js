const express = require('express');
const cors = require('cors');
const port =process.env.PORT || 5000;
const app =express();
const jwt = require('jsonwebtoken');
require('dotenv').config();


//Middleware 

app.use(cors());
app.use(express.json());


//shakibhasan1070
//FovSrV62QKHdbWUm

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



app.get('/',(req,res)=>{
    res.send('Younitech server is running');
});

app.listen(port,()=>{
    console.log(`Younitech server is running on PORT:${port}`);
})
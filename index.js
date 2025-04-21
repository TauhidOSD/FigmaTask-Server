//index.js

const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://tauhidhossen01:2S920cI4JR0Zj2KE@cluster0.xrofkmj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    const database = client.db("usersDB");
    const userCollection = database.collection("users");

    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
      console.log('New user added:', user);
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Connected to MongoDB");
  } finally {
    // Keep connection open
  }
}
run().catch(console.error);

app.get('/', (req, res) => {
  res.send('MongoDB Server is Running');
});

app.listen(port, () => {
  console.log(`MongoDB server running on http://localhost:${port}`);
});

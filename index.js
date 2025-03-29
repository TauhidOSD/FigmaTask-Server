const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');

app.use(cors());
app.use(express.json());
//tauhidhossen01
//2S920cI4JR0Zj2KE



const uri = "mongodb+srv://tauhidhossen01:2S920cI4JR0Zj2KE@cluster0.xrofkmj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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


    app.post('/users', async(req, res)=>{
        const user = req.body;
        console.log('new user',user);
        
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.log);


app.get('/',(req,res)=>{
    res.send('Sever is Running')
})

app.listen(port,() =>{
    console.log(`Simple Server is Running on Port:${port}`);
    
})


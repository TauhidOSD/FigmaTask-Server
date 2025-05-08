// const express = require('express');
// const cors = require('cors');
// const app = express();
// const port = process.env.PORT || 5500;

// // Middelware
// app.use(cors());
// app.use(express.json());

// //IsPTgZNhJhOAW0Rz


// // Form1

// const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = "mongodb+srv://billalsikdar03:3nCccy39gk2Yuewm@cluster0.dwscc5u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });


// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();

//     const database = client.db("usersDB");
//     const appCollection = database.collection("users");

//     app.post('/formone',async(req,res)=>{
//       const formOne = req.body;
//       console.log('new form',formOne);
//       const result = await appCollection.insertOne(formOne);
//       res.send(result);
//     })


//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     // await client.close();
//   }
// }
// run().catch(console.dir);


// app.get('/',(req,res)=>{
//     res.send('Younitech server is running Then what is the problem');
// })

// app.listen(port,()=>{
//     console.log(`Server is running on PORT:${port}`);
// })
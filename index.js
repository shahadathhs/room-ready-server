const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      'https://eleventh-a-roomready.web.app',
      'https://eleventh-a-roomready.firebaseapp.com'
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser())

const user = process.env.DB_USER
const password = process.env.DB_PASS

const uri = `mongodb+srv://${user}:${password}@cluster0.ahaugjj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    //await client.connect();

    // Get the database and collection on which to run the operation
    const database = client.db("roomReadyDB");
    const roomsCollection = database.collection("rooms");
    const bookingsCollection = database.collection("bookings");


    // rooms related api
    app.get("/rooms", async (req, res) => {
      const { minPrice, maxPrice } = req.query;
      let filter = {};
    
      if (minPrice && maxPrice) {
        filter = { pricePerNight: { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) } };
      } else if (minPrice) {
        filter = { pricePerNight: { $gte: parseInt(minPrice) } };
      } else if (maxPrice) {
        filter = { pricePerNight: { $lte: parseInt(maxPrice) } };
      }
    
      const cursor = roomsCollection.find(filter);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/rooms/:id", async(req, res) => {
      const id = req.params.id;
      const query = { _id : new ObjectId(id)};
      
      const result = await roomsCollection.findOne(query);
      res.send(result);
    })

    app.patch("/rooms/:id", async(req, res) => {
      const id = req.params.id;
      const filter ={ _id : new ObjectId(id)}
      const room = req.body;
      console.log(room)
      const updatedDoc = {
        $set:{
          availability: room.availability
        }
      }
      const result =await roomsCollection.updateOne(filter,updatedDoc)
      res.send(result)
    })

    //bookings related api
    app.post("/bookings", async(req,res) => {
      const booking = req.body;
      const result = await bookingsCollection.insertOne(booking)
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    //await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('RoomReady Server Running!')
})

app.listen(port, () => {
  console.log(`RoomReady Server listening on port ${port}`)
})
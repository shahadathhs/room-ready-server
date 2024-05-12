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

//middleware
const logger = async(req, res, next) => {
  console.log( 'hostname', req.hostname , 'method', req.method ,'Url', req.originalUrl)
  next()
}

const verifyToken = async(req, res, next) => {
  const token = req.cookies?.token;
  //console.log("middleware token", token)
  // token unavailable
  if (!token) {
    return res.status(401).send({message: "Unauthorized"})
  }
  // token available
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
    if(error){
      return res.status(401).send({message: "Invalid unauthorized"})
    }
    req.decodedToken = decoded;
    next();
  })
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production" ? true : false,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
};

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    //await client.connect();

    // Get the database and collection on which to run the operation
    const database = client.db("roomReadyDB");
    const roomsCollection = database.collection("rooms");
    const bookingsCollection = database.collection("bookings");
    const reviewsCollection = database.collection("reviews")

    //creating Token
    app.post("/jwt", logger, async (req, res) => {
      const userEmail = req.body;
      console.log("user for token", userEmail);
      const token = jwt.sign(userEmail, process.env.ACCESS_TOKEN_SECRET);

      res
        .cookie("token", token, cookieOptions)
        .send({ loginSuccess: true });
    });

    //clearing Token
    app.post("/logout", async (req, res) => {
      const userEmail = req.body;
      console.log("logging out", userEmail);
      res
        .clearCookie("token", { ...cookieOptions, maxAge: 0 })
        .send({ logoutSuccess: true });
    });

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

    app.put("/rooms/:id/add-review", (req, res) => {
      const id = req.params.id;
      const review = req.body;
    
      // Fetch the room object from the database
      roomsCollection.findOne({ _id: new ObjectId(id) })
        .then(room => {
          if (!room) {
            return res.status(404).json({ error: "Room not found" });
          }
    
          // Add the new review to the reviews array
          room.reviews.push(review);
    
          // Update the room object in the database
          roomsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { reviews: room.reviews } }
          )
            .then(() => {
              res.json({ message: "Review added successfully", review: review });
            })
            .catch(error => {
              console.error("Error updating room:", error);
              res.status(500).json({ error: "Internal server error" });
            });
        })
        .catch(error => {
          console.error("Error fetching room:", error);
          res.status(500).json({ error: "Internal server error" });
        });
    });
    

    //bookings related api
    app.get("/bookings", verifyToken, async(req, res) => {
      console.log("requestedData/userInfo", req.query);
      console.log('decodedToken/tokenOwnerInfo' ,req.decodedToken)
      if(req.query.email != req.decodedToken.email){
        return res.status(403).send({message : "forbidden"})
      }
      let query = {};
      if (req.query?.email) {
        query = {email :req.query.email};
       } 
      const result = await bookingsCollection.find(query).toArray();
      res.send(result);
    })

    app.get("/bookings/:id", async(req, res) => {
      const id = req.params.id;
      const query = { _id : new ObjectId(id)};
      const result = await bookingsCollection.findOne(query);
      res.send(result);
    })

    app.post("/bookings", async(req,res) => {
      const booking = req.body;
      const result = await bookingsCollection.insertOne(booking)
      res.send(result)
    })

    app.delete('/bookings/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id)}
      const result = await bookingsCollection.deleteOne(query);
      res.send(result);
    })

    app.patch("/bookings/:id", async(req, res) => {
      const id = req.params.id;
      const filter ={ _id : new ObjectId(id)}
      const booking = req.body;
      console.log(booking)
      const updatedDoc = {
        $set:{
          schedule: booking.schedule
        }
      }
      const result =await bookingsCollection.updateOne(filter,updatedDoc)
      res.send(result)
    })

    //review related api
    app.post("/reviews", async(req,res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review)
      res.send(result)
    })

    app.get("/reviews", async (req, res) => {
      const reviews = req.query;
      const cursor = reviewsCollection.find(reviews);
      const result = await cursor.toArray();
      res.send(result);
    });

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
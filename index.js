const express = require('express');
const app = express();
const cors = require("cors")
require('dotenv').config()
const port = process.env.PORT || 5000;

// Middleware

app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.send("MUZ Sports is running")
})

///////////////////////////////



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6rkaped.mongodb.net/?retryWrites=true&w=majority`;

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

        const classCollection = client.db("muzSports").collection("classes")
        const selectedClassCollection = client.db("muzSports").collection("selectedclasses")
        const usersCollection = client.db("muzSports").collection("users")

        //////////////////////Users API /////////////////////

        app.post('/users', async(req, res)=>{
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result)
        })



        /////////////////////////// Classes ////////////////////

        app.get('/classes', async (req, res) => {
            const result = await classCollection.find().toArray()
            res.send(result)
        })



        // selected Class collection

        app.get('/selectedclasses', async (req, res) => {
            const result = await selectedClassCollection.find({ email: req.query.email }).toArray()
            res.send(result)
        })

        app.post('/selectedclasses', async (req, res) => {
            const item = req.body;
            console.log(item);
            const result = await selectedClassCollection.insertOne(item)
            res.send(result)
        })

        app.delete('/selectedclasses/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await selectedClassCollection.deleteOne(query);
            res.send(result)

        })



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    }
    finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


//////////////////////////////

app.listen(port, () => {
    console.log(`muz sorts is running on ${port}`);
})


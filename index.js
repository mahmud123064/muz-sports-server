const express = require('express');
const app = express();
const cors = require("cors")
require('dotenv').config()
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');

// Middleware

app.use(cors());
app.use(express.json());

const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).send({ error: true, message: 'unauthorized access' })
    }
    const token = authorization.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRECT, (err, decoded) => {

        if (err) {
            return res.status(401).send({ error: true, message: 'unauthorized access' })
        }
        req.decoded = decoded;
        next()
    })
}


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


        //////////////JWT //////////////////////////

        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRECT, { expiresIn: '1h' })
            res.send({ token })
        })


        

        //////////////////////Users API /////////////////////

        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray()
            res.send(result)
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await usersCollection.findOne(query)
            if (existingUser) {
                return res.send({ message: " user already exists" })
            }
            const result = await usersCollection.insertOne(user);
            res.send(result)
        })

        // admin///////

        app.get('/users/admin/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;

            if (req.decoded.email !== email) {
                res.send({ admin: false })
            }

            const query = { email: email }
            const user = await usersCollection.findOne(query);
            const result = { admin: user?.role === "admin" }
            res.send(result)
        })

        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    role: 'admin'
                },
            };
            const result = await usersCollection.updateOne(filter, updateDoc)
            res.send(result)
        })

        /////////////////// Instructor  //////////////////

        app.patch('/users/instructor/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    role: 'instructor'
                },
            };
            const result = await usersCollection.updateOne(filter, updateDoc)
            res.send(result)
        })

        /////////////////////////// Classes ////////////////////

        app.get('/classes', async (req, res) => {
            const result = await classCollection.find().toArray()
            res.send(result)
        })



        // selected Class collection

        // app.get('/selectedclasses', async (req, res) => {
        //     const result = await selectedClassCollection.find({ email: req.query.email }).toArray()
        //     res.send(result)
        // })


        ///////////// verifyJWT /////////////////// eta use korle error aschilo 

        app.get('/selectedclasses', verifyJWT, async (req, res) => {
            const email = req.query.email;

            if (!email) {
                res.send([])
            }
            // etar jonno error aschilo  
            const decodedEmail = req.decoded.email;
            if (email !== decodedEmail) {
                return res.status(403).send({ error: true, message: 'forbidden access' })
            }
            ///////////////
            const query = { email: email };
            const result = await selectedClassCollection.find(query).toArray();
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


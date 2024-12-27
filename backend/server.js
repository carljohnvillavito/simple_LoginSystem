const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const app = express();
const port = 3000;

// Middleware to parse json in request body
app.use(express.json())
app.use(cors());
// Replace with your MongoDB connection string
const uri = "mongodb+srv://<carljohnMod>:<carljohn123>@cluster0.jxb4e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch(error){
        console.log('Error connecting to mongo db', error)
        await client.close()
    }
}
run().catch(console.dir);
//  Registration endpoint
app.post('/register', async (req, res) => {
  const { fullname, username, password } = req.body;

  if (!fullname || !username || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
    try {
        const db = client.db('auth');
        const users = db.collection('users');

        // Check if user already exists
        const existingUser = await users.findOne({ username: username });
        if (existingUser) {
           return res.status(409).json({ message: 'Username already exists' });
        }

         await users.insertOne({ fullname, username, password });
        res.status(201).json({ message: 'User created successfully' });

    }
     catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }

});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
      try {
         const db = client.db('auth');
         const users = db.collection('users');

            const user = await users.findOne({ username: username, password: password });
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

           res.status(200).json({ message: 'Logged in succesfully', fullname: user.fullname});

      }
       catch (error) {
          console.error('Error logging in user:', error);
         res.status(500).json({ message: 'Internal server error' });
      }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

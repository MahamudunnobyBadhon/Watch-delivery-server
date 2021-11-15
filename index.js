const express = require('express');
const { MongoClient } = require('mongodb');

const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()

var cors = require('cors')


const app = express();
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())
// myDBuser1
// s2QOSjZNp8Cl4NV5



const { json } = require('express');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.h2kkq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
      await client.connect();

      const database = client.db("ghori");
      const usersCollection = database.collection("users");
      const productsCollection = database.collection("products");
      const ordersCollection = database.collection('orders'); 
      const reviewsCollection = database.collection('reviews');


    // Get Products
    app.get('/products', async(req, res) => {
        const cursor = productsCollection.find({});
        const foods = await cursor.toArray();
        res.send(foods);
    })  

      //GET Single Products
      app.get('/products/:id', async(req, res) => {
          const id = req.params.id;
          const query = {_id : ObjectId(id)};
          const singleProduct = await productsCollection.findOne(query);
          res.json(singleProduct);
      })

      // get admin
      app.get('/users/:email', async(req, res) =>{
          const email = req.params.email;
          const query = {email: email};
          const user = await usersCollection.findOne(query);

          let isAdmin = false;
          if(user.role === "admin"){
            isAdmin = true;
          }

          res.json({admin : isAdmin});

      })

      //POST API for user
      app.post('/users', async(req, res) => {
          const user = req.body;
          console.log(user);
          const result = await usersCollection.insertOne(user);
          console.log(result);
          res.json(result);
      })

      //Upsert API for user
      app.put('/users', async(req, res) => {
          const user = req.body;
          const filter = {email: user.email};
          const options = {upsert: true};
          const updateDoc = {
              $set: user
          };
          const result = await usersCollection.updateOne(filter, updateDoc, options);
          res.json(result);

      })

      //Make Admin
      app.put('/users/admin', async(req, res) =>{
          const user = req.body;
          console.log('put', user);
          const filter = {email : user.email};
          const updateDoc = {
              $set: { role : "admin"}
          }
          const result = await usersCollection.updateOne(filter, updateDoc);
          console.log(result);
          res.json(result);

      })


      // Add products
      app.post('/products', async(req, res) => {
        const user = req.body;
        console.log(user);
        const result = await productsCollection.insertOne(user);
        console.log(result);
        res.json(result);
      })


        //POST API for Order

        app.post('/orders', async(req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            console.log(result);
            res.json(result);
        })

        // post for reviews
        app.post('/reviews', async(req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            console.log(result);
            res.json(result);
        })

        // get reviws
        app.get('/reviews', async(req, res) => {
            const cursor = reviewsCollection.find({});
            const foods = await cursor.toArray();
            res.send(foods);
        }) 

        // Get All Order
        app.get('/allOrders', async(req, res) => {
            const cursor = ordersCollection.find({});
  
            const allOrders = await cursor.toArray();
            res.send(allOrders);
        })  

        //get My orders
        app.get('/myOrders/:email', async (req, res) => {

            console.log(req.params.email);

            const cursor = await ordersCollection.find({email : req.params.email});

            const myOrders =await cursor.toArray();
            // const query = {email: req.params.email};
            // const result = await orderscollection.find({email: req.params.email});
            // const x = {result: result}
            res.send(myOrders);
            console.log(myOrders);
        })


        // Delete products
        app.delete("/deleteProduct/:id", async (req, res) => {

            const id = req.params.id;
            console.log(id);
            const query = {_id:ObjectId(id)};
            console.log(query);
            const result = await productsCollection.deleteOne(query);
            console.log(result);
            res.send(result);
        });

        // Delete my order
        app.delete("/deleteOrder/:id", async (req, res) => {

            const id = req.params.id;
            console.log(id);
            const query = {_id:ObjectId(id)};
            console.log(query);
            const result = await ordersCollection.deleteOne(query);
            console.log(result);
            res.send(result);
        });

        

        // Update order Pending Status
        app.put("/updateStatus/:id", async(req, res) => {
            const id = req.params.id;
            const updatedStatus = req.body.status;
            const filter = { _id: ObjectId(id) };
            console.log(updatedStatus);
            const result = await ordersCollection.updateOne(filter, {
                $set: { status: updatedStatus },
              })
            res.send(result);
              
        });
        

    } 
    finally {
    //   await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Running ghori-server')
})

app.listen(port, ()=>{
    console.log('running server on port', port);
})

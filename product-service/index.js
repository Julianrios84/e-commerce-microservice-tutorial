const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT_ONE || 8080;
const Product = require('./Product');
const jwt = require('jsonwebtoken');
const amqp = require('amqplib');
const isAuthenticated = require('../isAuthenticated');

app.use(express.json());

var order;
var channel, connection;

mongoose.connect(
  "mongodb://localhost/product-service",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }, () => {
    console.log(`Product-Service DB connected`)
  }
)

async function connect() { 
  const amqpServer = "amqp://localhost:5672";
  connection = await amqp.connect(amqpServer);
  channel = await connection.createChannel();
  await channel.assertQueue("PRODUCT");
}

connect();

// Create a new product.
app.post("/product/create", isAuthenticated, async (req, res) => {
  const { name, description, price } = req.body;
  const newProduct = new Product({
      name,
      description,
      price,
  });
  newProduct.save();
  return res.json(newProduct);
});

// Buy a product.
// User sends a list of product's IDs to buy 
// Creating an order with those products and a total value of sum of product's prices.
app.post("/product/buy", isAuthenticated, async (req, res) => {
  const { ids } = req.body;
  const products = await Product.find({ _id: { $in: ids } });
  channel.sendToQueue(
      "ORDER",
      Buffer.from(
          JSON.stringify({
              products,
              userEmail: req.user.email,
          })
      )
  );
  channel.consume("PRODUCT", (data) => {
    console.log("Consuming PRODUCT queue");
      order = JSON.parse(data.content);
      channel.ack(data);
  });
  return res.json(order);
});

// Start Server
app.listen(PORT, () => {
  console.log(`Product-Service at ${PORT}`);
});
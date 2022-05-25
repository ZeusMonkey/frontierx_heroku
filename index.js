const httpserver = require('http').createServer();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const orderRouter = require("./routes/orderRouter");
const keys = require('./config/keys');
const dbMongo = require('./db/dbMongo');
const path = require('path');
const httpPort = process.env.PORT || 5000;

const server = express();
const startServer = async () => {
  server.use(cors());
  server.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );
  server.use(bodyParser.json());
  server.use(function (req, res, next) {
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    );
    next();
  });

  server.use(express.static(path.join(__dirname, 'build')));
  
  server.use(
    "/order",
    orderRouter
  )

  server.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });

  server.listen(8000, "0.0.0.0", function() {
    console.log('server is running on port 8000');
  })
}

startServer();



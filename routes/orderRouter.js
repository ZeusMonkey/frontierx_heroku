'use strict';

const express = require('express');
const router = express.Router();
const dbMongo = require('../db/dbMongo');

router.get('/makeSellOrder', async function (req, res) {
  const {maker, img, price, tokenId, makerSignature} = req.query;
  const orderData = await dbMongo.insertOrderBook({maker, price, img, tokenId, makerSignature});
  console.log(orderData);
  if (orderData)
    res.send({status: true});
  else
    res.send({status: false});
})

router.get('/getMySellRequests', async function (req, res) {
  const {ids} = req.query;
  let idArray = ids.split(',');
  let orderData = await dbMongo.findOrderBook({
    "tokenId": {"$in": idArray}
  });
  orderData = orderData.map(item => {return {id: item.tokenId, price: item.price}})
  res.send({status: true, data: orderData});
})

router.get('/findAvailableSellOrders', async function (req, res) {
  const {address} = req.query;
  let orderData = await dbMongo.findOrderBook({
    "maker": {"$ne": address}
  });
  res.send({status: true, data: orderData});
})

router.get('/removeOrder', async function (req, res) {
  const {tokenId} = req.query;
  await dbMongo.removeOrder({tokenId});
  res.send({status: true});
});

module.exports = router;
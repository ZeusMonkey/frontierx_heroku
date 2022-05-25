'use strict'

const keys = require('../config/keys');
const mongoose_1 = require('mongoose');
const Int32 = require('mongoose-int32').loadType(mongoose_1);
const sleep = require('sleep-promise');
// connect to the mongo db server
let connectToMongoDb;
try {
  connectToMongoDb = async (connectionCheck = false) => {
    let conStatus = false;
    mongoose_1.set('debug', false);
    await mongoose_1.connect(
      keys.DB_CONNECTION_STRING,
      { useUnifiedTopology: true, useNewUrlParser: true },
      async (err) => {
        // if we failed to connect, abort and retry
        if (err) {
          conStatus = false;
          console.error('Error Connecting to MongoDB:', err);
          if (!connectionCheck) {
            // Wait X seconds and try again if any error occurred
            await sleep(1000 * 10);
            console.log('Retrying connecting to MongoDB...');
            connectToMongoDb();
          }
        } else {
          if (!connectionCheck) {
            console.log('mongoDB Connected');
          }
          conStatus = true;
        }
      }
    );
    return conStatus;
  };

  connectToMongoDb();
} catch (err) {
  console.error(err);
}

const connection = mongoose_1.connection;

// Catch errors from mongoose after the connection is established.
connection.on('error', (err) => {
  console.error('MongoDB Error:', err);
});

connection.on('disconnected', () => {
  console.error('MongoDB Connection Closed');
});

const Schema = mongoose_1.Schema;
const HIDDEN_FIELDS = { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 };

const orderBook = new Schema(
  {
    maker: { type: String, default: '' },
    price: { type: String, default: 0 },
    img: { type: String, default: '' },
    tokenId: { type: Int32, default: 0 },
    taker: { type: String, default: '' },
    makerSignature: { type: String, default: '' },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
    collection: 'orderBook',
  }
);

orderBook.set('toJSON', {
  transform: (doc, ret) => {
    if (ret.tokenId) ret.tokenId = Number(ret.tokenId.toString());
    return ret;
  },
});

const orderBookModel = connection.model('orderBook', orderBook);
async function insertOrderBook(data) {
  let OrderBookModel = new orderBookModel();
  OrderBookModel.maker = data.maker || '';
  OrderBookModel.price = data.price || 0;
  OrderBookModel.tokenId = data.tokenId || 0;
  OrderBookModel.img = data.img || '';
  OrderBookModel.taker = data.taker || '';
  OrderBookModel.makerSignature = data.makerSignature || '';
  OrderBookModel = await OrderBookModel.save();
  return OrderBookModel.toJSON();
}
exports.insertOrderBook = insertOrderBook;

async function findOrderBook(data) {
  var ret = await orderBookModel
    .find(data)
    .sort({ createdAt: -1 })
    .exec();
  if (ret) {
    if (ret && ret.length) {
      let arr = [];
      for (const item of ret) {
        arr[arr.length] = item.toJSON();
      }
      return arr;
    }
  }
  return [];
}
exports.findOrderBook = findOrderBook;


async function removeOrder(data) {
  await orderBookModel.findOneAndDelete(data).exec();
}
exports.removeOrder = removeOrder;
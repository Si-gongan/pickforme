import mongoose from 'mongoose';

export enum ProductType {
  SUBSCRIPTION = 'SUBSCRIPTION',
  PURCHASE = 'PURCHASE',
}

const ProductSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ProductType,
    required: [true, 'can\'t be blank'],
  },
  price: {
    type: Number,
    required: [true, 'can\'t be blank'],
  },
  point: {
    type: Number,
    required: [true, 'can\'t be blank'],
  },
  name: {
    type: String,
    required: [true, 'can\'t be blank'],
  },
}, {
  timestamps: true,
});

const model = mongoose.models.Products || mongoose.model('Products', ProductSchema);

/*
model.insertMany([{
    name: '베이직',
    point: 10,
    price: 4900,
    type: 'SUBSCRIPTION',
  }, {
    name: '스탠다드',
    point: 20,
    price: 9500,
    type: 'SUBSCRIPTION',
  }, {
    name: '프리미엄',
    point: 30,
    price: 14000,
    type: 'SUBSCRIPTION',
  }, {
    name: '1픽 (1회 의뢰가능)',
    point: 1,
    price: 550,
    type: 'PURCHASE',
  }, {
    name: '5픽 (5회 의뢰가능)',
    point: 5,
    price: 2750,
    type: 'PURCHASE',
  }]);
*/

export default model;

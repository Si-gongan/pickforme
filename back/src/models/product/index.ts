import mongoose from 'mongoose';

export enum ProductType {
  SUBSCRIPTION = 0,
  PURCHASE = 1,
}

const ProductSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: Object.values(ProductType),
    required: [true, 'can\'t be blank'],
  },
  productId: {
    type: String,
    required: [true, 'can\'t be blank'],
  },
  platform: {
    type: String,
    enum: ['ios', 'android'],
  },
  point: {
    type: Number,
    required: [true, 'can\'t be blank'],
  },
}, {
  timestamps: true,
});

const model = mongoose.models.Products || mongoose.model('Products', ProductSchema);

model.find({}).then((products) => {
  if (products.length) {
    return;
  }
  model.insertMany([{
    platform: 'ios',
    productId: 'pickforme_basic',
    point: 10,
    type: 1,
  }, {
    platform: 'ios',
    productId: 'pickforme_standard',
    point: 20,
    type: 1,
  }, {
    platform: 'ios',
    productId: 'pickforme_premium',
    point: 30,
    type: 1,
  }, {
    platform: 'ios',
    productId: 'pickforme_1pick',
    type: 0,
    point: 1,
  }, {
    platform: 'ios',
    productId: 'pickforme_5pick',
    type: 0,
    point: 5,
  }]);
});

export default model;

import mongoose from 'mongoose';

export enum ProductType {
  PURCHASE = 0,
  SUBSCRIPTION = 1,
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
    type: ProductType.SUBSCRIPTION,
  }, {
  /*
    platform: 'ios',
    productId: 'pickforme_standard',
    point: 20,
    type: ProductType.SUBSCRIPTION,
  }, {
    platform: 'ios',
    productId: 'pickforme_premium',
    point: 30,
    type: ProductType.SUBSCRIPTION,
  }, {
  */
    platform: 'ios',
    productId: 'pickforme_1pick',
    type: ProductType.PURCHASE,
    point: 1,
  }, {
    platform: 'ios',
    productId: 'pickforme_5pick',
    type: ProductType.PURCHASE,
    point: 5,
  }]);
});

export default model;

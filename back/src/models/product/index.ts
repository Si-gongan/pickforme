import mongoose from 'mongoose';

export enum ProductType {
  PURCHASE = 0,
  SUBSCRIPTION = 1,
}

export enum Platform {
  IOS = 'ios',
  ANDROID = 'android',
}

const ProductSchema = new mongoose.Schema({
  type: {
    type: Number,
    required: [true, 'can\'t be blank'],
  },
  productId: {
    type: String,
    required: [true, 'can\'t be blank'],
  },
  platform: {
    type: String,
    enum: Object.values(Platform),
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
    platform: Platform.IOS,
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
    platform: Platform.IOS,
    productId: 'pickforme_1pick',
    type: ProductType.PURCHASE,
    point: 1,
  }, {
    platform: Platform.IOS,
    productId: 'pickforme_5pick',
    type: ProductType.PURCHASE,
    point: 5,
  }, {
    platform: Platform.ANDROID,
    productId: 'pickforme_basic',
    point: 10,
    type: ProductType.SUBSCRIPTION,
  }, {
    platform: Platform.ANDROID,
    productId: 'pickforme_1pick',
    type: ProductType.PURCHASE,
    point: 1,
  }, {
    platform: Platform.ANDROID,
    productId: 'pickforme_5pick',
    type: ProductType.PURCHASE,
    point: 5,
  }]);
});

export default model;

import mongoose from 'mongoose';
import { ProductType, Platform, ProductReward, IProduct, ProductModel } from './types';

const ProductSchema = new mongoose.Schema(
  {
    type: {
      type: Number,
      required: [true, "can't be blank"],
    },
    displayName: {
      type: String,
      required: [true, "can't be blank"],
    },
    productId: {
      type: String,
      required: [true, "can't be blank"],
    },
    platform: {
      type: String,
      enum: Object.values(Platform),
    },
    point: {
      type: Number,
      required: [true, "can't be blank"],
    },
    aiPoint: {
      type: Number,
      required: [true, "can't be blank"],
    },
  },
  {
    timestamps: true,
  },
);


const model = mongoose.models.Products as ProductModel || mongoose.model<IProduct, ProductModel>('Products', ProductSchema);

ProductSchema.methods.getRewards = function(): ProductReward {
  return {
    point: this.point,
    aiPoint: this.aiPoint,
  };
};

// 초기 데이터 삽입
model.find({}).then((products) => {
  if (products.length) {
    return;
  }
  model.insertMany([
    {
      platform: Platform.IOS,
      productId: 'pickforme_plus',
      displayName: '픽포미 플러스',
      point: 10,
      aiPoint: 100,
      type: ProductType.SUBSCRIPTION,
    },
    // {
    //   platform: Platform.IOS,
    //   displayName: '픽포미 1픽',
    //   productId: 'pickforme_1pick',
    //   type: ProductType.PURCHASE,
    //   point: 1,
    // }, {
    //   platform: Platform.IOS,
    //   displayName: '픽포미 5픽',
    //   productId: 'pickforme_5pick',
    //   type: ProductType.PURCHASE,
    //   point: 5,
    // },
    {
      platform: Platform.ANDROID,
      productId: 'pickforme_plus',
      displayName: '픽포미 플러스',
      point: 10,
      type: ProductType.SUBSCRIPTION,
    },
    // {
    //   platform: Platform.ANDROID,
    //   displayName: '픽포미 1픽',
    //   productId: 'pickforme_1pick',
    //   type: ProductType.PURCHASE,
    //   point: 1,
    // }, {
    //   platform: Platform.ANDROID,
    //   productId: 'pickforme_5pick',
    //   displayName: '픽포미 5픽',
    //   type: ProductType.PURCHASE,
    //   point: 5,
    // }
  ]);
});

export * from './types';

export default model;

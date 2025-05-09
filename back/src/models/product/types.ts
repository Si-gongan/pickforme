import mongoose from "mongoose";

export enum ProductType {
    PURCHASE = 0,
    SUBSCRIPTION = 1,
  }
  
  export enum Platform {
    IOS = 'ios',
    ANDROID = 'android',
  }

  export interface ProductReward {
    point: number;
    aiPoint: number;
    event?: number;
  }

export interface IProduct {
    type: ProductType;
    displayName: string;
    productId: string;
    platform: Platform;
    point: number;
    aiPoint: number;
    
}
  
export interface ProductDocument extends IProduct, mongoose.Document {
    getRewards(): ProductReward;
  }

export interface ProductModel extends mongoose.Model<ProductDocument> {
}
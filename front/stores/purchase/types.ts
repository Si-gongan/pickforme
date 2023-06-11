export interface Product {
  _id: string,
  name: string,
  point: number,
  price: number,
  type: 'PURCHASE' | 'SUBSCRIPTION',
}

export interface PurchaseProductParams extends Pick<Product, '_id'> {};

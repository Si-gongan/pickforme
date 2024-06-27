export interface PostLogParams {
  product: {
    id?: number;
    url?: string;
    group: string;
  }
  action: string;
  metaData?: any;
}
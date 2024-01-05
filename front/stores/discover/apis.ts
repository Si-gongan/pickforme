import client from '../../utils/axios';

import {
  GetMainProductsResponse,
} from './types';

export const GetMainProductsAPI = () => client.get<GetMainProductsResponse>('/discover/products');

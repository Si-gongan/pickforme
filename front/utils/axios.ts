import axios from 'axios';
import { API_HOST } from '@env';

const client = axios.create({
  baseURL: API_HOST,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setClientToken = (token?: string) => {
  if (token) {
    client.defaults.headers.common = {
      ...client.defaults.headers.common,
      authorization: `Bearer ${token}`,
    };
  } else {
    delete client.defaults.headers.common.authorization;
  }
}

export default client;

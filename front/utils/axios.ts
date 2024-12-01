import axios from 'axios';
import { API_HOST } from '@env';

console.log(API_HOST);


const client = axios.create({
  baseURL: API_HOST,
  headers: {
    'Content-Type': 'application/json',
  },
});
client.defaults.timeout = 40000;

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

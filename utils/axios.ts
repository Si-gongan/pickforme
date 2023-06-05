import axios from 'axios';

// export const API_HOST = process.env.API_HOST;
export const API_HOST = 'http://172.30.1.55:3000';

const client = axios.create({
  baseURL: API_HOST,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default client;

import axios from 'axios';

const API_HOST = 'https://ai.sigongan-ai.shop';

const client = axios.create({
  baseURL: API_HOST,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default client;

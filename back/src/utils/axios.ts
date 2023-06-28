import axios from 'axios';

const API_HOST = 'http://3.145.178.241:8000';

const client = axios.create({
  baseURL: API_HOST,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default client;

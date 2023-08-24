import axios from 'axios';

const API_HOST = 'http://54.87.223.235:8000';

const client = axios.create({
  baseURL: API_HOST,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default client;

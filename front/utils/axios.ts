import axios from 'axios';

// export const API_HOST = process.env.API_HOST;
export const API_HOST = 'http://ec2-3-14-136-232.us-east-2.compute.amazonaws.com:3000';

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

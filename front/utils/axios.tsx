import axios from 'axios';
import { API_HOST } from '../constants/info';

// console.log('API_HOST', API_HOST);
console.log('baseURL', 'http://52.79.85.108:3000');

const baseURL = 'http://52.79.85.108:3000';
// const baseURL = 'https://api.sigongan-ai.shop';
// const baseURL = API_HOST

const client = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});
client.defaults.timeout = 40000;

export const setClientToken = (token?: string) => {
    if (token) {
        client.defaults.headers.common = {
            ...client.defaults.headers.common,
            authorization: `Bearer ${token}`
        };
    } else {
        delete client.defaults.headers.common.authorization;
    }
};

export function changeToken(value?: string) {
    if (!value) {
        delete client.defaults.headers.common.authorization;
    } else {
        client.defaults.headers.common = {
            ...client.defaults.headers.common,
            authorization: `Bearer ${value}`
        };
    }
}

export default client;

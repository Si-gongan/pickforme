import axios from "axios";

export const client = axios.create({
  baseURL: "https://api.sigongan-ai.shop",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
client.defaults.timeout = 40000;

export function changeToken(value?: string) {
  if (!value) {
    delete client.defaults.headers.common.authorization;
  } else {
    client.defaults.headers.common = {
      ...client.defaults.headers.common,
      authorization: `Bearer ${value}`,
    };
  }
}

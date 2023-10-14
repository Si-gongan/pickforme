import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({
  path: `${__dirname}/../../.env`,
});

const API_HOST = 'https://slack.com/api';

const slackClient = axios.create({
  baseURL: API_HOST,
  headers: {
    'Content-type': 'application/json',
    Authorization: `Bearer ${process.env.SLACK_OAUTH_TOKEN}`,
  },
});

export default slackClient;

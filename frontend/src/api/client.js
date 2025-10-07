import axios from 'axios';

const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || '').trim();

const client = axios.create({
  baseURL:
    API_BASE_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : ''),
  withCredentials: false
});

export default client;

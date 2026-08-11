import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Will be proxied by Vite
  withCredentials: true
});

export default api;

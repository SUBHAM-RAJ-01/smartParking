import axios from 'axios';
const API = axios.create({ 
  baseURL: 'https://smartparking-9yf6.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});
export default API; 
const LOCAL_API_URL = 'http://localhost:8080';
const PRODUCTION_API_URL = 'https://yexdynamics-portal.onrender.com';

export const API_BASE_URL = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  ? LOCAL_API_URL
  : PRODUCTION_API_URL;

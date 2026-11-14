import axios from 'axios'

export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // Ensure session cookies (JSESSIONID) are sent and received
  withCredentials: true,
})

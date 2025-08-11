// API configuration for development and production
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export function getToken() {
  return localStorage.getItem('token');
}

export async function apiRequest(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  
  const url = `${API_URL}${path}`;
  
  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}
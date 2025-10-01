// src/services/fetchService.js
import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://levenex.macbookonrent.in/api/v1/";
const getAuthHeaders = (tokenKey = 'token') => {
  const token = localStorage.getItem(tokenKey);
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
  };
};

const handleAuthError = (error, redirectPath = '/dashboard/login') => {
  if ([401, 403].includes(error.response?.status)) {
    const message = error.response?.data?.message;
    if (message === 'Invalid or expired token') {
      localStorage.removeItem('usertoken');
    } else {
      localStorage.removeItem('token');
    }
    setTimeout(() => {
      window.location.href = redirectPath;
    }, 100);
  }
  throw error;
};

const request = async (method, url, data = null) => {
  try {
    
    const headers = getAuthHeaders('token');
    const response = await axios({
      method,
      url: baseUrl + url,
      headers,
      data,
    });
    return response.data;
  } catch (error) {
    handleAuthError(error);
  }
};

const userRequest = async (method, url, data = null) => {
  try {
    const headers = getAuthHeaders('usertoken');
    const response = await axios({
      method,
      url: baseUrl + url,
      headers,
      data,
    });
    return response.data;
  } catch (error) {
    handleAuthError(error);
  }
};

const fileDownload = async (method, url, data = null) => {
  try {
    
    const headers = getAuthHeaders('token');
    const response = await axios({
      method,
      url: baseUrl + url,
      headers,
      data,
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    handleAuthError(error);
  }
};


const loginRequest = async (url, data) => {
  const response = await axios.post(baseUrl + url, data);
  return response.data;
};

const fetchService = {
  request,
  userRequest,
  fileDownload,
  loginRequest,
};

export default fetchService;

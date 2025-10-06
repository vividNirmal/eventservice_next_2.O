import axios from "axios";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4080/api/v1";
function getToken(tokenKey = "token") {
  if (typeof window !== "undefined") {
    return localStorage.getItem(tokenKey);
  }
  return null;
}

async function apiRequest(method, url, data = null, tokenKey = "token") {
  const token = getToken(tokenKey);

  const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;

  const config = {
    method,
    url: fullUrl,
    headers: {},
  };

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  if (data && !(data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }

  if (data) {
    config.data = data;
  }

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        `API error: ${error.response.status} - ${error.response.data?.message || error.message}`
      );
    } else {
      throw new Error(`Network error: ${error.message}`);
    }
  }
}

export function apiGet(url, tokenKey) {
  return apiRequest("GET", url, null, tokenKey);
}

export function apiPost(url, data, tokenKey) {
  return apiRequest("POST", url, data, tokenKey);
}

export function apiPut(url, data, tokenKey) {
  return apiRequest("PUT", url, data, tokenKey);
}

export function apiDelete(url, tokenKey) {
  return apiRequest("DELETE", url, null, tokenKey);
}


export async function apiGetFile(url, tokenKey) {
  const token = getToken(tokenKey);
  const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
  const config = {
    method: "GET",
    url: fullUrl,
    headers: {},
    responseType: "blob",
  };
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  try {
    const response = await axios(config);
    return response.data; 
  } catch (error) {
    throw new Error("File download failed");
  }
}

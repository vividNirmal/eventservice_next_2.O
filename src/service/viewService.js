const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  // "https://levenex.macbookonrent.in/api/v1";
  "http://localhost:4080/api/v1";

function getToken(tokenKey = "token") {
  if (typeof window !== "undefined") {
    return localStorage.getItem(tokenKey);
  }
  return;
}

export async function getRequest(path) {
  const token = getToken();
  if (!token) {
    localStorage.removeItem("token");
    window.location.href = "/dashboard/login";
  }
  return fetch(`${baseURL}/${path}`, {
    next: { revalidate: 3600 },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        if (
          !response.ok &&
          (response.status == 403 || response.status == 401)
        ) {
          localStorage.removeItem("token");
          window.location.href = "/dashboard/login";
        }
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

export async function getApiWithParam(path, param) {
  const token = getToken();
  if (!token) {
    throw new Error("No token found");
  }
  return fetch(`${baseURL}/${path}/${param}`, {
    next: { revalidate: 3600 },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .catch(() => ({ success: false }));
}

export async function postRequest(path, data) {
  const token = getToken();
  
  // Prepare headers object
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  
  // Prepare body based on data type
  let body;
  if (data instanceof FormData) {    
    body = data;
  } else {    
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(data);
  }
  
  return fetch(`${baseURL}/${path}`, {
    method: "POST",
    headers: headers,
    body: body,
  })
    .then((response) => response.json())
    .catch((error) => console.error(error));
}

export async function deleteRequest(path) {
  const token = getToken();

  let headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(`${baseURL}/${path}`, { method: "DELETE", headers: headers })
    .then((response) => response.json())
    .catch((error) => console.error(error));
}

export async function updateRequest(path, data) {
  // Prepare headers object
  const headers = {};

  // add token if available
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  // Only set Content-Type to application/json if data is NOT FormData
  // When sending FormData, browser automatically sets correct Content-Type with boundary
  if (!(data instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  
  return fetch(`${baseURL}/${path}`, {
    method: "PUT",
    headers: headers,
    body: data instanceof FormData ? data : JSON.stringify(data),
  })
    .then((response) => response.json())
    .catch((error) => console.error(error));
}

export async function patchUpdateRequest(path, data) {
  // Prepare headers object
  const headers = {};
  
  // Only set Content-Type to application/json if data is NOT FormData
  // When sending FormData, browser automatically sets correct Content-Type with boundary
  if (!(data instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  
  return fetch(`${baseURL}/${path}`, {
    method: "PATCH",
    headers: headers,
    body: data instanceof FormData ? data : JSON.stringify(data),
  })
    .then((response) => response.json())
    .catch((error) => console.error(error));
}

export async function getApiResponce(path, apikey) {
  return fetch(`${path}`, {
    method: "GET",
    headers: {
      "X-Api-Key": `${apikey}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .catch((error) => console.error(error));
}

export async function loginRequest(path, data) {
  // Prepare headers object
  const headers = {};
  
  // Only set Content-Type to application/json if data is NOT FormData
  // When sending FormData, browser automatically sets correct Content-Type with boundary
  if (!(data instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  
  return fetch(`${baseURL}/${path}`, {
    method: "POST",
    headers: headers,
    body: data instanceof FormData ? data : JSON.stringify(data),
  })
    .then((response) => response.json())
    .catch((error) => console.error(error));
}

export async function fileDownloadRequest(method, url, data = null) {
  const fullUrl = `${baseURL}/${url}`;
  const token = getToken();

  const options = {
    method: method,
    headers: {},
  };

  if (token) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  if (data) {
    if (data instanceof FormData) {
      options.body = data;
    } else {
      options.headers = {
        ...options.headers,
        "Content-Type": "application/json",
      };
      options.body = JSON.stringify(data) ?? JSON.stringify(data);
    }
  }

  //try {
  const response = await fetch(fullUrl, options);

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Unknown error" }));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }

  return await response.blob(); // Return blob for file download
}

export async function userGetRequest(path) {
  return fetch(`${baseURL}/${path}`, {
    next: { revalidate: 3600 },
  })
    .then(async (response) => {
      const result = await response.json();      
      return result;
    })
    .catch((error) => {
      console.error('userGetRequest error:', error);
      return { status: 0, message: 'Network error occurred', error: error.message };
    });
}

export async function   userPostRequest(path, data) {  
  const headers = {};  
  if (!(data instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(`${baseURL}/${path}`, {
    method: "POST",
    headers: headers,
    body: data,
  })
    .then(async (response) => {
      const result = await response.json();
      // Check if the response was successful
      if (!response.ok) {
        return {
          error: result.message?.message || result?.message || result.error || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          code: result.code || 'HTTP_ERROR',
          success: false,
          errorJson : result
        };
      }

      // Check if the API returned an error in the response body
      if (result.error || result.code === 'INTERNAL_SERVER_ERROR' || (typeof result.message?.message === 'string' && result.message.message.includes('error'))) {
        
        
        return {          
          error: result.message?.message || result?.message || result.error || 'Unknown error occurred',
          status: response.status,
          code: result.code || 'API_ERROR',
          success: false,
          message: result.message || null,
        
        };
      }

      // Return successful response
      return {
        ...result,
        success: true
      };
    })
    .catch((error) => {
      console.error('Network error:', error);
      return {
        error: 'Network error. Please check your connection and try again.',
        success: false,
        code: 'NETWORK_ERROR'
      };
    });
}
export async function userGetRequestWithToken(path) {
  const token = getToken("usertoken");
  if (!token) {
    throw new Error("No token found");
  }
  return fetch(`${baseURL}/${path}`, {
    next: { revalidate: 3600 },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
    })
    .catch((error) => {
      return error;
    });
}
export async function userPostRequestWithToken(path, data) {
  const token = getToken("usertoken");
  if (!token) {
    throw new Error("No token found");
  }
  
  // Prepare headers object
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  
  // Only set Content-Type to application/json if data is NOT FormData
  // When sending FormData, browser automatically sets correct Content-Type with boundary
  if (!(data instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  
  return fetch(`${baseURL}/${path}`, {
    method: "POST",
    headers: headers,
    body: data,
  })
    .then((response) => response.json())
    .catch((error) => console.error(error));
}

export async function pdfgenrate(path, body) {
  return fetch(`${baseURL}/${path}`, {
    method: "POST",
    body: body,
  })
    .then((response) => response.blob())
    .catch((error) => console.error(error));
}

export async function SacnnerPost(path, body) {  
  
  return fetch(`${baseURL}/${path}`, {
    method: "POST",  
    body: body,
  })
    .then((response) => response.blob())
    .catch((error) => console.error(error));
}

export async function SacnnerGet(path) {  
  return fetch(`${baseURL}/${path}`)
    .then((response) => {      
      
      if (response.ok) {
        return response.json();
      }else{
        return response
      }
    })
    .catch((error) => {
      return {
        statusCode: error.response?.status || 403,
        data: error.response?.data || { message: "An error occurred" },
      };
    });
}

export async function attengessPostRequest(path, data) { 
  const token = getToken();
  
  if (!token) {
    console.error("❌ No authentication token found");
    return {
      error: 'No authentication token. Please login again.',
      success: false,
      code: 'NO_TOKEN'
    };
  }

  const headers = {
    Authorization: `Bearer ${token}`,
  };
  
  if (!(data instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  try {
    console.log("📡 Making request to:", `${baseURL}/${path}`);
    
    const response = await fetch(`${baseURL}/${path}`, {
      method: "POST",
      headers: headers,
      body: data,
    });
    let result;
    try {
      result = await response.json();
      console.log("📡 Parsed JSON result:", result);
    } catch (jsonErr) {      
      return {
        error: `Invalid response format: ${response.statusText}`,
        status: response.status,
        success: false,
        code: 'INVALID_JSON'
      };
    }

    // FIX: Check if HTTP response was not ok (4xx, 5xx)
    if (!response.ok) {      
      return {
        error: result?.message?.message || result?.message || result?.error || `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
        code: result?.code || 'HTTP_ERROR',
        success: false,
        errorJson: result
      };
    }

    // FIX: Check if API returned an error in the response body
    if (result?.error || result?.code === 'INTERNAL_SERVER_ERROR') {      
      return {
        error: result?.message?.message || result?.message || result?.error || 'Unknown error occurred',
        status: response.status,
        code: result?.code || 'API_ERROR',
        success: false,
        message: result?.message || null,
        errorJson: result
      };
    }

    // FIX: For successful responses, ensure status is set correctly
    if (result?.status === 1 || result?.success === true) {      
      return {
        ...result,
        success: true
      };
    }

    // FIX: If status is 0 but no error flag, still treat as error
    if (result?.status === 0) {
      console.log("⚠️ Status 0 response (error state)");
      return {
        status: 0,
        success: false,
        error: result?.message || "Verification failed",
        errorJson: result
      };
    }

    // Fallback: Return as is if structure doesn't match expected
    console.log("⚠️ Unexpected response structure:", result);
    return {
      ...result,
      success: result?.status === 1
    };

  } catch (error) {
    console.error('❌ Network or other error:', error);
    console.error('❌ Error type:', error?.name);
    console.error('❌ Error message:', error?.message);
    
    return {
      error: error?.message || 'Network error. Please check your connection and try again.',
      success: false,
      code: 'NETWORK_ERROR',
      networkError: error
    };
  }
}


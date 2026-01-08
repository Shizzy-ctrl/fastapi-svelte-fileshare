export const API_URL = import.meta.env.VITE_API_URL || '/api';

export interface ApiResponse<T = any> {
  data?: T;
  detail?: string;
  error?: string;
}

export interface ApiError extends Error {
  isTokenExpired?: boolean;
  status?: number;
}

export async function apiRequest<T = any>(
  endpoint: string, 
  method: string = 'GET', 
  body: any = null, 
  token: string | null = null
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);

    // Handle non-JSON responses (like Nginx errors)
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      const error = new Error(`Server returned non-JSON response (${response.status}): ${text.substring(0, 100)}...`) as ApiError;
      error.status = response.status;
      throw error;
    }

    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data.detail || 'API Request Failed') as ApiError;
      error.status = response.status;
      
      // Check for token expiration
      if (response.status === 401 || 
          data.detail?.toLowerCase().includes('token') ||
          data.detail?.toLowerCase().includes('expired') ||
          data.detail?.toLowerCase().includes('unauthorized')) {
        error.isTokenExpired = true;
      }
      
      throw error;
    }
    return data;
  } catch (error) {
    throw error;
  }
}

export async function uploadFiles(files: FileList, token: string): Promise<any> {
  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append('files', files[i]);
  }

  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  // Handle non-JSON responses
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    const error = new Error(`Upload failed with non-JSON response (${response.status}): ${text.substring(0, 100)}...`) as ApiError;
    error.status = response.status;
    throw error;
  }

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.detail || 'Upload Failed') as ApiError;
    error.status = response.status;
    
    // Check for token expiration
    if (response.status === 401 || 
        data.detail?.toLowerCase().includes('token') ||
        data.detail?.toLowerCase().includes('expired') ||
        data.detail?.toLowerCase().includes('unauthorized')) {
      error.isTokenExpired = true;
    }
    
    throw error;
  }
  return data;
}

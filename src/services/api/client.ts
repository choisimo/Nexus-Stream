/**
 * API Client Configuration
 * Centralized HTTP client with interceptors and error handling
 */

import axios, { AxiosInstance, AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Types
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: Record<string, any>;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_TIMEOUT = 30000; // 30 seconds

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Include cookies in requests
});

// Token management
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (token) {
    localStorage.setItem('access_token', token);
  } else {
    localStorage.removeItem('access_token');
  }
};

export const getAccessToken = (): string | null => {
  if (!accessToken) {
    accessToken = localStorage.getItem('access_token');
  }
  return accessToken;
};

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token if available
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request ID for tracing
    config.headers['X-Request-ID'] = crypto.randomUUID();

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.url}`, response.data);
    }

    // Extract data from standard response format
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data;
    }

    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - Token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await apiClient.post('/auth/refresh', { refreshToken });
          const { accessToken: newAccessToken } = response.data;
          
          setAccessToken(newAccessToken);
          
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        setAccessToken(null);
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const apiError: ApiError = {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      status: error.response?.status || 500,
      code: error.response?.data?.code,
      details: error.response?.data?.details,
    };

    // Log error in development
    if (import.meta.env.DEV) {
      console.error(`❌ API Error: ${error.config?.url}`, apiError);
    }

    // Show user-friendly error messages
    if (error.response?.status === 404) {
      apiError.message = 'Resource not found';
    } else if (error.response?.status === 403) {
      apiError.message = 'You do not have permission to perform this action';
    } else if (error.response?.status === 500) {
      apiError.message = 'Server error. Please try again later';
    } else if (error.code === 'ECONNABORTED') {
      apiError.message = 'Request timeout. Please check your connection';
    } else if (!error.response) {
      apiError.message = 'Network error. Please check your connection';
    }

    return Promise.reject(apiError);
  }
);

// API methods
export const api = {
  get: <T = any>(url: string, config?: any) => 
    apiClient.get<T, ApiResponse<T>>(url, config),
  
  post: <T = any>(url: string, data?: any, config?: any) => 
    apiClient.post<T, ApiResponse<T>>(url, data, config),
  
  put: <T = any>(url: string, data?: any, config?: any) => 
    apiClient.put<T, ApiResponse<T>>(url, data, config),
  
  patch: <T = any>(url: string, data?: any, config?: any) => 
    apiClient.patch<T, ApiResponse<T>>(url, data, config),
  
  delete: <T = any>(url: string, config?: any) => 
    apiClient.delete<T, ApiResponse<T>>(url, config),
};

// File upload helper
export const uploadFile = async (
  url: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<ApiResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  });
};

// Batch request helper
export const batchRequest = async (
  requests: Array<{ method: string; url: string; data?: any }>
): Promise<ApiResponse[]> => {
  return Promise.all(
    requests.map((req) => {
      switch (req.method.toLowerCase()) {
        case 'get':
          return api.get(req.url);
        case 'post':
          return api.post(req.url, req.data);
        case 'put':
          return api.put(req.url, req.data);
        case 'patch':
          return api.patch(req.url, req.data);
        case 'delete':
          return api.delete(req.url);
        default:
          throw new Error(`Unsupported method: ${req.method}`);
      }
    })
  );
};

export default apiClient;

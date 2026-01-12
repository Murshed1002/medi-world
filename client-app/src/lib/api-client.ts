import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.MEDI_SERVICE_HOST || 'http://localhost:8080',
  withCredentials: true, // Send cookies with every request
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle 401 and auto-refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry auth endpoints (they legitimately return 401 for invalid credentials)
    const isAuthEndpoint = originalRequest.url?.includes('/auth/send-otp') || 
                          originalRequest.url?.includes('/auth/verify-otp') ||
                          originalRequest.url?.includes('/auth/login');

    // If 401 and we haven't retried yet and it's not an auth endpoint
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        await axios.post(
          `${apiClient.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Redirect to login if refresh fails - but only if not already on login page
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          if (!currentPath.includes('/login') && !currentPath.includes('/verify-otp')) {
            window.location.href = '/patient/login';
          }
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export { apiClient };
export default apiClient;

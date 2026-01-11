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

    // If 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
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
        // Redirect to login if refresh fails
        if (typeof window !== 'undefined') {
          window.location.href = '/patient/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export { apiClient };
export default apiClient;

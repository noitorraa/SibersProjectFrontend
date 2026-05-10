import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  console.log("[API request]", {
    method: config.method,
    url: `${config.baseURL}${config.url}`,
    params: config.params,
    data: config.data,
  });
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    console.log("[API response]", {
      url: `${response.config.baseURL}${response.config.url}`,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("[API error]", {
      url: `${error?.config?.baseURL ?? ""}${error?.config?.url ?? ""}`,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    return Promise.reject(error);
  },
);

export default apiClient;

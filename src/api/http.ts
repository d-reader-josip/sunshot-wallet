import axios from "axios";

const HELIUS_API_KEY = "daa6ad1c-8711-4157-8272-6d9897a1e2f4";

export const http = axios.create({
  baseURL: "https://api.helius.xyz",
  params: { "api-key": HELIUS_API_KEY },
});

http.interceptors.request.use((config) => {
  config.params = config.params || {};
  config.params["api-key"] = HELIUS_API_KEY;
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    // if (axios.isAxiosError(error)) return error.response?.data?.message
    if (error.response?.data) return Promise.reject(error.response.data);
    else return Promise.reject(error);
  }
);

http.defaults.params = {};
http.defaults.params["api-key"] = HELIUS_API_KEY;

export default http;

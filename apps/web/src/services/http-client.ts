import axios from "axios";

export const httpClient = axios.create({ baseURL: "/api", timeout: 20_000 });

httpClient.interceptors.request.use((request) => {
  request.headers.set("Accept", "application/json");
  return request;
});

httpClient.interceptors.response.use(undefined, (cause: unknown) => {
  if (axios.isAxiosError(cause)) {
    const message = cause.response?.data?.error || cause.message;
    return Promise.reject(new Error(typeof message === "string" ? message : "Request failed"));
  }
  return Promise.reject(cause);
});

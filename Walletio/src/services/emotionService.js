import { fetchAPI } from "./api";

export const emotionService = {
  getAll: (token) => fetchAPI("/emotions", { token }),
};

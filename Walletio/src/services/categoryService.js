import { fetchAPI } from "./api";

export const categoryService = {
  getAll: (token) => fetchAPI("/categories", { token }),
  create: (token, data) =>
    fetchAPI("/categories", { method: "POST", token, body: data }),
  update: (token, id, data) =>
    fetchAPI(`/categories/${id}`, { method: "PATCH", token, body: data }),
  delete: (token, id) =>
    fetchAPI(`/categories/${id}`, { method: "DELETE", token }),
};

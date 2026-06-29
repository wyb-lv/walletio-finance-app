import { fetchAPI } from "./api";

export const transferService = {
  getAll: (token) => fetchAPI("/transfers", { token }),
  create: (token, data) =>
    fetchAPI("/transfers", { method: "POST", token, body: data }),
  delete: (token, id) =>
    fetchAPI(`/transfers/${id}`, { method: "DELETE", token }),
};

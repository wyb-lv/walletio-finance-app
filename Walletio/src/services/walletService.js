import { fetchAPI } from "./api";

export const walletService = {
  getAll: (token) => fetchAPI("/wallets", { token }),
  getSummary: (token) => fetchAPI("/wallets/summary", { token }),
  create: (token, data) =>
    fetchAPI("/wallets", { method: "POST", token, body: data }),
  update: (token, id, data) =>
    fetchAPI(`/wallets/${id}`, { method: "PATCH", token, body: data }),
  delete: (token, id) =>
    fetchAPI(`/wallets/${id}`, { method: "DELETE", token }),
};

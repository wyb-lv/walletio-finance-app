import { fetchAPI } from "./api";

export const spendingGroupService = {
  getAll: (token) => fetchAPI("/spending-groups", { token }),
  create: (token, data) =>
    fetchAPI("/spending-groups", { method: "POST", token, body: data }),
  update: (token, id, data) =>
    fetchAPI(`/spending-groups/${id}`, { method: "PATCH", token, body: data }),
  delete: (token, id) =>
    fetchAPI(`/spending-groups/${id}`, { method: "DELETE", token }),
};

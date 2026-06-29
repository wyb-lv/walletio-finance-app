import { fetchAPI } from "./api";

export const budgetService = {
  getAll: (token) => fetchAPI("/budgets", { token }),
  create: (token, data) =>
    fetchAPI("/budgets", { method: "POST", token, body: data }),
  getAllocations: (token) => fetchAPI("/budgets/allocation", { token }),
  update: (token, data) =>
    fetchAPI("/budgets", { method: "PATCH", token, body: data }),
  upsertAllocation: (token, data) =>
    fetchAPI("/budgets/allocation", { method: "PUT", token, body: data }),
};

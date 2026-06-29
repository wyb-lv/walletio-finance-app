import { fetchAPI } from "./api";

const toQuery = (params = {}) => {
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");
  return query ? `?${query}` : "";
};

export const analyticService = {
  getSummary: (token, year) =>
    fetchAPI(`/analytics/summary${toQuery({ year })}`, { token }),
  getOverview: (token, params = {}) =>
    fetchAPI(`/analytics/overview${toQuery(params)}`, { token }),
  getBalance: (token) => fetchAPI("/analytics/balance", { token }),
};

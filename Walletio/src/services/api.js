import { API_BASE_URL } from "../utils/constants";

/**
 * Generic fetch wrapper
 * @param {string} endpoint - relative path e.g. "/wallets"
 * @param {RequestInit & { token?: string }} options
 * @returns {Promise<any>}
 */
export const fetchAPI = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const { token, headers, body, ...fetchOptions } = options;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const defaultHeaders = {
    Accept: "application/json",
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(url, {
    ...fetchOptions,
    body: body && typeof body !== "string" && !isFormData ? JSON.stringify(body) : body,
    headers: { ...defaultHeaders, ...headers },
  });

  const text = await response.text();
  const data = text
    ? (() => {
        try {
          return JSON.parse(text);
        } catch {
          return text;
        }
      })()
    : null;

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      (typeof data === "string" ? data : null) ||
      `HTTP ${response.status}`;
    throw new Error(message);
  }

  return data;
};

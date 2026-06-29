import { fetchAPI } from "./api";

export const authService = {
  login: (credentials) =>
    fetchAPI("/auth/login", { method: "POST", body: credentials }),
  register: (userData) =>
    fetchAPI("/auth/signup", { method: "POST", body: userData }),
  // Exchange a refresh token for a new session via the gateway.
  refresh: (refreshToken) =>
    fetchAPI("/auth/refresh", { method: "POST", body: { refresh_token: refreshToken } }),
  getProfile: (token) => fetchAPI("/profile", { token }),
  updateProfile: (token, profileData) =>
    fetchAPI("/profile", { method: "PATCH", token, body: profileData }),
  uploadAvatar: (token, imageBase64) =>
    fetchAPI("/profile/avatar", { method: "POST", token, body: { image_base64: imageBase64 } }),
  changePassword: (token, data) =>
    fetchAPI("/auth/password", { method: "PUT", token, body: data }),
};

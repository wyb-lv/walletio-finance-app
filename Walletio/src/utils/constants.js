import { Platform } from "react-native";

// ─── API Base URL ───────────────────────────────────────────────────────────
// All requests go through the API gateway (port 8080), which verifies the token
// and forwards to the backend. The gateway proxies the same `/api/...` paths.
const DEV_API_HOST = Platform.OS === "android" ? "10.0.2.2" : "localhost";
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? `http://${DEV_API_HOST}:8080/api`;

import { Ionicons } from "@expo/vector-icons";

const FALLBACK_ICON = "apps-outline";

export const safeIonicon = (name, fallback = FALLBACK_ICON) => {
  const candidate = typeof name === "string" ? name.trim() : "";
  const fallbackName = typeof fallback === "string" ? fallback.trim() : FALLBACK_ICON;
  const glyphMap = Ionicons?.glyphMap ?? {};

  if (candidate && Object.prototype.hasOwnProperty.call(glyphMap, candidate)) {
    return candidate;
  }

  if (fallbackName && Object.prototype.hasOwnProperty.call(glyphMap, fallbackName)) {
    return fallbackName;
  }

  return FALLBACK_ICON;
};

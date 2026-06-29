import React from "react";
import { Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { safeIonicon } from "../../utils/icons";

/**
 * Renders a category/group icon that may be stored either as an Ionicons name
 * (e.g. "car-outline") or as an emoji (e.g. "🚗") in the database.
 *  - Valid Ionicons name  -> <Ionicons />
 *  - Anything else non-empty (emoji/unicode) -> rendered as text
 *  - Empty/missing -> the Ionicons `fallback`
 */
export default function CategoryIcon({ icon, size = 24, color, fallback = "apps-outline" }) {
  const value = typeof icon === "string" ? icon.trim() : "";
  const glyphMap = Ionicons?.glyphMap ?? {};
  const isIoniconName = value && Object.prototype.hasOwnProperty.call(glyphMap, value);

  if (value && !isIoniconName) {
    // Not an Ionicons glyph — treat it as an emoji/text icon.
    return <Text style={{ fontSize: Math.round(size * 0.9), color, lineHeight: size }}>{value}</Text>;
  }

  return <Ionicons name={safeIonicon(value, fallback)} size={size} color={color} />;
}

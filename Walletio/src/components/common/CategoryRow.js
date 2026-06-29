import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { borderRadius, spacing } from "../../theme/spacing";

const ICON_MAP = {
  "Ăn uống": { emoji: "🍜", bg: "#F7E4BC" },
  "Nhà cửa": { emoji: "🏠", bg: "#E8F4DC" },
  "Di chuyển": { emoji: "🚗", bg: "#DDEFF5" },
  "Giải trí": { emoji: "🎮", bg: "#FBE7E0" },
  "Mua sắm": { emoji: "🛍️", bg: "#F4E8D8" },
  "Cà phê": { emoji: "☕", bg: "#F1DDC7" },
  "Sức khoẻ": { emoji: "💊", bg: "#DFF4E8" },
  "Giáo dục": { emoji: "📚", bg: "#E1F2F1" },
  "Lương": { emoji: "💼", bg: "#DFF4E8" },
  "Khác": { emoji: "📦", bg: "#EEF5EA" },
  "default": { emoji: "💰", bg: "#EEF5EA" },
};

/**
 * CategoryRow — shows icon, name, optional progress bar, and amount
 */
export default function CategoryRow({
  name = "Danh mục",
  amount = 0,
  budget = 0,
  showBar = false,
  barColor = colors.primary,
  amountColor,
}) {
  const icon = ICON_MAP[name] ?? ICON_MAP["default"];
  const progress = budget > 0 ? Math.min(amount / budget, 1) : 0;
  const displayColor = amountColor ?? colors.textPrimary;

  return (
    <Animated.View entering={FadeInUp.duration(360)} style={styles.row}>
      <View style={[styles.iconWrap, { backgroundColor: icon.bg }]}>
        <Text style={styles.emoji}>{icon.emoji}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.name}>{name}</Text>
          <Text style={[styles.amount, { color: displayColor }]}>
            {amount.toLocaleString("vi-VN")}₫
          </Text>
        </View>
        {showBar && (
          <View style={styles.track}>
            <View style={[styles.bar, { width: `${progress * 100}%`, backgroundColor: barColor }]} />
          </View>
        )}
        {budget > 0 && (
          <Text style={styles.budget}>VNĐ {budget.toLocaleString("vi-VN")}</Text>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.sm },
  iconWrap: { width: 44, height: 44, borderRadius: borderRadius.md, justifyContent: "center", alignItems: "center", marginRight: spacing.base },
  emoji: { fontSize: 21 },
  content: { flex: 1 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.sm },
  name: { flex: 1, fontSize: typography.fontSize.md, fontFamily: typography.family.semiBold, color: colors.textPrimary },
  amount: { fontSize: typography.fontSize.md, fontFamily: typography.family.bold },
  track: { height: 8, backgroundColor: colors.surfaceAlt, borderRadius: 99, marginTop: spacing.xs, overflow: "hidden" },
  bar: { height: "100%", borderRadius: 99 },
  budget: { fontSize: typography.fontSize.xs, color: colors.textMuted, marginTop: 4 },
});

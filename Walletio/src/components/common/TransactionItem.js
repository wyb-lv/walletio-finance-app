import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { borderRadius, spacing } from "../../theme/spacing";

const CATEGORY_ICONS = {
  "Ăn uống": { emoji: "🍜", bg: "#F7E4BC" },
  "Nhà cửa": { emoji: "🏠", bg: "#E8F4DC" },
  "Di chuyển": { emoji: "🚗", bg: "#DDEFF5" },
  "Giải trí": { emoji: "🎮", bg: "#FBE7E0" },
  "Mua sắm": { emoji: "🛍️", bg: "#F4E8D8" },
  "Lương": { emoji: "💼", bg: "#DFF4E8" },
  "Thưởng": { emoji: "🎁", bg: "#E8F4DC" },
  "Khác": { emoji: "📦", bg: "#EEF5EA" },
  "default": { emoji: "💰", bg: "#EEF5EA" },
};

/**
 * TransactionItem — single row in transaction history list
 */
export default function TransactionItem({ description = "Giao dịch", category = "", amount = 0, type = "expense", date = "" }) {
  const isIncome = type === "income";
  const icon = CATEGORY_ICONS[category] ?? CATEGORY_ICONS["default"];

  return (
    <Animated.View entering={FadeInRight.duration(360)} style={styles.row}>
      <View style={[styles.iconWrap, { backgroundColor: icon.bg }]}>
        <Text style={styles.emoji}>{icon.emoji}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.desc} numberOfLines={1}>{description}</Text>
        {!!date && <Text style={styles.date}>{date}</Text>}
      </View>
      <Text style={[styles.amount, { color: isIncome ? colors.income : colors.expense }]}>
        {isIncome ? "+" : "-"}{Math.abs(amount).toLocaleString("vi-VN")}₫
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.sm },
  iconWrap: { width: 44, height: 44, borderRadius: borderRadius.md, justifyContent: "center", alignItems: "center", marginRight: spacing.base },
  emoji: { fontSize: 21 },
  info: { flex: 1, paddingRight: spacing.sm },
  desc: { fontSize: typography.fontSize.md, fontFamily: typography.family.semiBold, color: colors.textPrimary },
  date: { fontSize: typography.fontSize.xs, color: colors.textMuted, marginTop: 3 },
  amount: { fontSize: typography.fontSize.md, fontFamily: typography.family.bold },
});

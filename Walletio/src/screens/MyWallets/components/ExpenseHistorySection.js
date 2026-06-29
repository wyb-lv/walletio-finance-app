import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, shadows } from "../../../theme/colors";
import { typography } from "../../../theme/typography";
import { borderRadius, spacing } from "../../../theme/spacing";

const formatMoney = (amount = 0) => `${Math.abs(amount).toLocaleString("vi-VN")}đ`;

export function ExpenseHistoryRow({ expense }) {
  const direction = expense.direction ?? (expense.type === "income" ? "in" : "out");
  const isIn = direction === "in";
  const amountColor = isIn ? colors.income : colors.expense;
  const amountPrefix = isIn ? "+" : "-";
  const date = expense.expense_date ?? expense.date ?? "";
  const note = expense.note || expense.description || "Không có ghi chú";

  return (
    <View style={styles.row}>
      <View style={styles.emotionIcon}>
        <Text style={styles.emotionEmoji}>{expense.emotionEmoji ?? "🙂"}</Text>
      </View>

      <View style={styles.rowBody}>
        <Text style={styles.categoryName} numberOfLines={1}>
          {expense.categoryName ?? expense.category ?? "Danh mục"}
        </Text>
        <Text style={styles.noteText} numberOfLines={1}>
          {note}
        </Text>
      </View>

      <View style={styles.sideInfo}>
        <Text style={styles.walletName} numberOfLines={1}>
          {expense.walletName ?? "Ví tiền"}
        </Text>
        <Text style={[styles.amount, { color: amountColor }]} numberOfLines={1}>
          {amountPrefix}
          {formatMoney(expense.amount)}
        </Text>
        <Text style={styles.dateText} numberOfLines={1}>
          {date}
        </Text>
      </View>
    </View>
  );
}

export default function ExpenseHistorySection({ expenses = [], onOpenAll }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Lịch sử giao dịch</Text>
        </View>
        <TouchableOpacity
          style={styles.linkButton}
          onPress={onOpenAll}
          activeOpacity={0.78}
        >
          <Text style={styles.linkText}>Tất cả</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.historyCard}>
        {expenses.length > 0 ? (
          expenses.slice(0, 5).map((expense, index) => (
            <View key={expense.id}>
              <ExpenseHistoryRow expense={expense} />
              {index < Math.min(expenses.length, 5) - 1 && (
                <View style={styles.divider} />
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name="receipt-outline"
              size={24}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyText}>Chưa có expense nào.</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.family.bold,
    color: colors.textPrimary,
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  linkText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.family.bold,
    color: colors.primary,
  },
  historyCard: {
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
    ...shadows.soft,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  emotionIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
    backgroundColor: colors.surfaceAlt,
  },
  emotionEmoji: {
    fontSize: 24,
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
    paddingRight: spacing.sm,
  },
  categoryName: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.family.bold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  walletName: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.family.semiBold,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  noteText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.family.medium,
    color: colors.textMuted,
  },
  sideInfo: {
    alignItems: "flex-end",
    maxWidth: 118,
  },
  amount: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.family.bold,
  },
  dateText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.family.medium,
    color: colors.textMuted,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  emptyState: {
    minHeight: 96,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: spacing.xs,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.family.medium,
    color: colors.textSecondary,
    textAlign: "center",
  },
});

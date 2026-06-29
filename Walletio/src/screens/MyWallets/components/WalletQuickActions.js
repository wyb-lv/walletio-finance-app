import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, shadows } from "../../../theme/colors";
import { typography } from "../../../theme/typography";
import { borderRadius, spacing } from "../../../theme/spacing";

const ACTIONS = [
  {
    key: "create",
    label: "Tạo ví mới",
    icon: "add-circle-outline",
    route: "AddWallet",
    color: colors.primary,
  },
  {
    key: "transfer",
    label: "Chuyển giữa ví",
    icon: "swap-horizontal-outline",
    route: "TransferMoney",
    color: colors.info,
  },
];

export default function WalletQuickActions({ navigation }) {
  return (
    <View style={styles.row}>
      {ACTIONS.map((action) => (
        <TouchableOpacity
          key={action.key}
          style={styles.action}
          onPress={() => navigation.navigate(action.route)}
          activeOpacity={0.82}
        >
          <View style={[styles.iconWrap, { backgroundColor: `${action.color}18` }]}>
            <Ionicons name={action.icon} size={22} color={action.color} />
          </View>
          <Text style={styles.actionText}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  action: {
    flex: 1,
    minHeight: 92,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
    ...shadows.soft,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  actionText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.family.bold,
    color: colors.textPrimary,
    textAlign: "center",
    lineHeight: 18,
  },
});

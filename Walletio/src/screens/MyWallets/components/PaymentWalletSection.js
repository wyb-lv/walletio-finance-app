import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import WalletCard from "../../../components/common/WalletCard";
import { colors, shadows } from "../../../theme/colors";
import { typography } from "../../../theme/typography";
import { borderRadius, spacing } from "../../../theme/spacing";

export default function PaymentWalletSection({
  wallets = [],
  onOpenWallet,
  onAddWallet,
  onDeleteWallet,
  title = "Ví thanh toán",
  emptyText = "Chưa có ví thanh toán nào.",
  showAdd = true,
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {showAdd && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={onAddWallet}
            activeOpacity={0.78}
          >
            <Ionicons name="add" size={18} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {wallets.map((wallet) => (
        <TouchableOpacity
          key={wallet.id}
          onPress={() => onOpenWallet(wallet)}
          onLongPress={() => onDeleteWallet(wallet)}
          activeOpacity={0.82}
        >
          <WalletCard
            name={wallet.name}
            balance={wallet.balance}
            icon={wallet.icon}
            color={wallet.color}
            isDefault={wallet.isDefault}
          />
        </TouchableOpacity>
      ))}

      {wallets.length === 0 && (
        <View style={styles.emptyCard}>
          <Ionicons name="wallet-outline" size={24} color={colors.textSecondary} />
          <Text style={styles.emptyText}>{emptyText}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
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
  sectionSubtitle: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.family.medium,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addButton: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.soft,
  },
  emptyCard: {
    minHeight: 96,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.base,
  },
  emptyText: {
    marginTop: spacing.xs,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.family.medium,
    color: colors.textSecondary,
    textAlign: "center",
  },
});

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";
import { colors, shadows } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { borderRadius, spacing } from "../../theme/spacing";
import { safeIonicon } from "../../utils/icons";

const WALLET_ICONS = {
  "Tiền mặt": { icon: "cash-outline", color: "#22C55E", bg: "#E8F4DC" },
  "Tài khoản ngân hàng": { icon: "card-outline", color: "#3B82F6", bg: "#DDEFF5" },
  "Ví điện tử": { icon: "phone-portrait-outline", color: "#A855F7", bg: "#F7E4BC" },
  default: { icon: "wallet-outline", color: colors.primary, bg: "#EEF5EA" },
};

/**
 * WalletCard — row with wallet icon, name, and balance
 */
export default function WalletCard({
  name = "Ví",
  balance = 0,
  selected = false,
  icon,
  color,
  isDefault = false,
}) {
  const iconConfig = WALLET_ICONS[name] ?? WALLET_ICONS["default"];
  const iconName = safeIonicon(icon, iconConfig.icon);
  const iconColor = color || iconConfig.color;

  return (
    <Animated.View
      entering={FadeInUp.duration(420).springify()}
      style={[styles.card, selected && styles.cardSelected]}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${iconColor}22` }]}>
        <Ionicons name={iconName} size={24} color={iconColor} />
      </View>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{name}</Text>
          {isDefault && <Text style={styles.defaultBadge}>Mặc định</Text>}
        </View>
        <Text style={styles.balance}>{balance.toLocaleString("vi-VN")}₫</Text>
      </View>
      {selected && <View style={styles.dot} />}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  cardSelected: { borderColor: colors.primary, backgroundColor: "#F3FAF4" },
  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.base,
  },
  info: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  name: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.family.medium,
    color: colors.textSecondary,
  },
  defaultBadge: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontFamily: typography.family.semiBold,
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  balance: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.family.bold,
    color: colors.textPrimary,
    marginTop: 4,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
});

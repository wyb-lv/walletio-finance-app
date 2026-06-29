import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, shadows } from "../../../theme/colors";
import { typography } from "../../../theme/typography";
import { borderRadius, spacing } from "../../../theme/spacing";

export default function GoogleAuthButton({ label, onPress }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.86}>
      <View style={styles.iconWrap}>
        <Ionicons name="logo-google" size={20} color={colors.textPrimary} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.elevated,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
    ...shadows.soft,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceTint,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: colors.textPrimary,
    fontFamily: typography.family.bold,
    fontSize: typography.fontSize.base,
  },
});

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, shadows } from "../../../theme/colors";
import { typography } from "../../../theme/typography";
import { borderRadius, spacing } from "../../../theme/spacing";

const money = (value = 0) =>
  `${value.toLocaleString("vi-VN", { maximumFractionDigits: 0 })}đ`;

export default function BudgetHeroCard({
  allocated = 0,
  unallocated = 0,
  onAllocate,
  onEdit,
}) {
  return (
    <View style={styles.frame}>
      <View style={styles.card}>
        <View style={[styles.blob, styles.blobMain]} />
        <View style={[styles.blob, styles.blobTop]} />
        <View style={[styles.blob, styles.blobBottom]} />
        <View style={styles.face}>
          <View style={styles.eyeLeft} />
          <View style={styles.eyeRight} />
          <View style={styles.pupilLeft} />
          <View style={styles.pupilRight} />
          <View style={styles.mouth} />
        </View>

        <View style={styles.copyLayer}>
          <View style={styles.metricBlock}>
            <View style={styles.metricLabelRow}>
              <Text style={styles.metricLabel}>Tiền đã phân bổ</Text>
            </View>
            <Text
              style={styles.metricAmount}
              adjustsFontSizeToFit
              minimumFontScale={0.72}
              numberOfLines={1}
            >
              {money(allocated)}
            </Text>
          </View>

          <View style={styles.metricBlock}>
            <View style={styles.metricLabelRow}>
              <Text style={styles.metricLabel}>Tiền chưa phân bổ</Text>
            </View>
            <Text
              style={styles.metricAmount}
              adjustsFontSizeToFit
              minimumFontScale={0.72}
              numberOfLines={1}
            >
              {money(unallocated)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.allocateButton}
          onPress={onAllocate}
          activeOpacity={0.84}
        >
          <Text style={styles.allocateText}>GIAO VIỆC CHO TIỀN</Text>
          <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  card: {
    height: 230,
    borderRadius: 22,
    backgroundColor: "#FFF2B8",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(8,75,52,0.08)",
    ...shadows.lifted,
  },
  copyLayer: {
    position: "absolute",
    left: spacing.base,
    top: spacing.base,
    width: "58%",
    zIndex: 2,
  },
  metricBlock: {
    marginBottom: spacing.base,
  },
  metricLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xl,
    marginBottom: 1,
  },
  metricLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.family.medium,
    color: "#5F655E",
  },
  metricAmount: {
    fontSize: typography.fontSize.xl,
    lineHeight: 34,
    fontFamily: typography.family.regular,
    color: "#161A16",
  },
  blob: {
    position: "absolute",
    backgroundColor: "#E9B900",
    borderWidth: 2,
    borderColor: "#5B5014",
  },
  blobMain: {
    right: -68,
    top: 26,
    width: 166,
    height: 166,
    borderRadius: 83,
  },
  blobTop: {
    right: 46,
    top: -38,
    width: 86,
    height: 86,
    borderRadius: 43,
  },
  blobBottom: {
    right: 56,
    bottom: -42,
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  face: {
    position: "absolute",
    right: 26,
    top: 75,
    width: 56,
    height: 34,
    zIndex: 2,
  },
  eyeLeft: {
    position: "absolute",
    left: 14,
    top: 5,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
  },
  eyeRight: {
    position: "absolute",
    right: 14,
    top: 6,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
  },
  pupilLeft: {
    position: "absolute",
    left: 17,
    top: 7,
    width: 4,
    height: 4,
    borderRadius: 3,
    backgroundColor: "#6B5810",
  },
  pupilRight: {
    position: "absolute",
    right: 18,
    top: 8,
    width: 4,
    height: 4,
    borderRadius: 3,
    backgroundColor: "#6B5810",
  },
  mouth: {
    position: "absolute",
    alignSelf: "center",
    top: 22,
    width: 7,
    height: 9,
    borderRadius: 7,
    backgroundColor: "#6B5810",
  },
  allocateButton: {
    position: "absolute",
    left: spacing.base,
    right: spacing.base,
    bottom: spacing.base,
    minHeight: 50,
    borderRadius: 12,
    backgroundColor: "#34A052",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    zIndex: 4,
  },
  allocateText: {
    fontSize: 19,
    fontFamily: typography.family.bold,
    color: "#FFFFFF",
    textAlign: "center",
  },
});

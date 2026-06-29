import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, shadows } from "../../../theme/colors";
import { typography } from "../../../theme/typography";
import { spacing } from "../../../theme/spacing";

const formatMoney = (amount = 0) => `${amount.toLocaleString("vi-VN")}đ`;

export default function WalletHeroCard({
  totalBalance = 0,
  paymentBalance = 0,
  trackedBalance = 0,
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <View style={[styles.blob, styles.blobLeft]} />
        <View style={[styles.blob, styles.blobSmallLeft]} />
        <View style={[styles.blob, styles.blobCenter]} />
        <View style={[styles.blob, styles.blobRight]} />

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.assetLabel}>Tổng tài sản</Text>
            <Ionicons
              name="eye-outline"
              size={24}
              color="rgba(255,255,255,0.86)"
            />
          </View>

          <Text
            style={styles.assetAmount}
            adjustsFontSizeToFit
            minimumFontScale={0.62}
            numberOfLines={1}
          >
            {formatMoney(totalBalance)}
          </Text>

          <View style={styles.statRail}>
            <View style={styles.statCell}>
              <Text style={styles.statLabel}>Thanh toán</Text>
              <Text
                style={styles.statValue}
                adjustsFontSizeToFit
                minimumFontScale={0.74}
                numberOfLines={1}
              >
                {formatMoney(paymentBalance)}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCell}>
              <Text style={styles.statLabel}>Theo dõi</Text>
              <Text
                style={styles.statValue}
                adjustsFontSizeToFit
                minimumFontScale={0.74}
                numberOfLines={1}
              >
                {formatMoney(trackedBalance)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.face}>
          <View style={styles.eyeLeft} />
          <View style={styles.eyeRight} />
          <View style={styles.pupilLeft} />
          <View style={styles.pupilRight} />
          <View style={styles.mouth} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.base,
    borderRadius: 22,
    ...shadows.lifted,
  },
  card: {
    height: 212,
    borderRadius: 20,
    backgroundColor: "#005333",
    overflow: "hidden",
  },
  content: {
    zIndex: 2,
    paddingTop: spacing.base,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  assetLabel: {
    fontSize: 18,
    lineHeight: 23,
    fontFamily: typography.family.medium,
    color: "rgba(255,255,255,0.86)",
  },
  assetAmount: {
    width: "100%",
    textAlign: "center",
    fontSize: 42,
    lineHeight: 52,
    fontFamily: typography.family.regular,
    color: "#FFFFFF",
    marginBottom: spacing.xs,
  },
  statRail: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 0,
  },
  statCell: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: 52,
    backgroundColor: "rgba(255,255,255,0.18)",
    marginHorizontal: spacing.base,
  },
  statLabel: {
    fontSize: 16,
    lineHeight: 21,
    fontFamily: typography.family.bold,
    color: "rgba(255,255,255,0.52)",
    marginBottom: 2,
  },
  statValue: {
    width: "100%",
    textAlign: "center",
    fontSize: 19,
    lineHeight: 24,
    fontFamily: typography.family.bold,
    color: colors.textInverse,
  },
  blob: {
    position: "absolute",
    bottom: -58,
    backgroundColor: "#E9B900",
    borderWidth: 2,
    borderColor: "#4E4A13",
  },
  blobLeft: {
    left: -32,
    width: 112,
    height: 112,
    borderRadius: 56,
  },
  blobSmallLeft: {
    left: 56,
    width: 96,
    height: 96,
    borderRadius: 48,
    bottom: -62,
  },
  blobCenter: {
    alignSelf: "center",
    width: 260,
    height: 260,
    borderRadius: 130,
    bottom: -168,
  },
  blobRight: {
    right: -14,
    width: 116,
    height: 116,
    borderRadius: 58,
    bottom: -56,
  },
  face: {
    position: "absolute",
    zIndex: 3,
    alignSelf: "center",
    bottom: 52,
    width: 58,
    height: 32,
  },
  eyeLeft: {
    position: "absolute",
    left: 15,
    top: 3,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFFFFF",
  },
  eyeRight: {
    position: "absolute",
    right: 15,
    top: 5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFFFFF",
  },
  pupilLeft: {
    position: "absolute",
    left: 18,
    top: 5,
    width: 3,
    height: 3,
    borderRadius: 3,
    backgroundColor: "#6B5810",
  },
  pupilRight: {
    position: "absolute",
    right: 19,
    top: 7,
    width: 3,
    height: 3,
    borderRadius: 3,
    backgroundColor: "#6B5810",
  },
  mouth: {
    position: "absolute",
    alignSelf: "center",
    top: 19,
    width: 7,
    height: 9,
    borderRadius: 7,
    backgroundColor: "#6B5810",
  },
});

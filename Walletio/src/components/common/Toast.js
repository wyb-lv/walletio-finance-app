import React, { useEffect, useRef } from "react";
import { Animated, Text, StyleSheet } from "react-native";
import { colors, shadows } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { borderRadius, spacing } from "../../theme/spacing";

/**
 * Toast – thông báo nổi tự biến mất sau 2.5s
 * Props:
 *   message  : string
 *   type     : "success" | "error" | "info"
 *   visible  : bool
 *   onHide   : () => void
 */
export default function Toast({ message, type = "success", visible, onHide }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(opacity, { toValue: 1, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -20,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => onHide?.());
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  const bgColor =
    type === "success"
      ? colors.success
      : type === "error"
        ? colors.error
        : colors.info;
  const icon = type === "success" ? "✓" : type === "error" ? "✕" : "ℹ";

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: bgColor, opacity, transform: [{ translateY }] },
      ]}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    top: 60,
    left: spacing.base,
    right: spacing.base,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.lg,
    zIndex: 9999,
    ...shadows.lifted,
  },
  icon: {
    fontSize: 18,
    color: "#fff",
    marginRight: spacing.sm,
    fontFamily: typography.family.bold,
  },
  message: {
    flex: 1,
    color: "#fff",
    fontSize: typography.fontSize.md,
    fontFamily: typography.family.medium,
  },
});

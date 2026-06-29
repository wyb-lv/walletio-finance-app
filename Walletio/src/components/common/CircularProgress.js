import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";

/**
 * CircularProgress — donut chart
 * @param {number} size         - diameter
 * @param {number} strokeWidth  - ring thickness
 * @param {number} progress     - 0..1
 * @param {string} centerLabel  - top text
 * @param {string} centerValue  - big number text
 * @param {string} centerSub    - small subtitle
 */
export default function CircularProgress({
  size = 140,
  strokeWidth = 14,
  progress = 0.6,
  centerLabel = "Còn lại",
  centerValue = "4.500.000₫",
  centerSub = "",
  color = colors.primary,
  trackColor = "#E8F5F0",
  textColor = colors.textPrimary,
  labelColor = colors.textSecondary,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - Math.min(Math.max(progress, 0), 1));
  const cx = size / 2;
  const cy = size / 2;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        {/* Track */}
        <Circle
          cx={cx} cy={cy} r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress */}
        <Circle
          cx={cx} cy={cy} r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${cx}, ${cy}`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={[styles.label, { color: labelColor }]}>{centerLabel}</Text>
        <Text style={[styles.value, { color: textColor }]}>{centerValue}</Text>
        {!!centerSub && <Text style={[styles.sub, { color: labelColor }]}>{centerSub}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center" },
  label:  { fontSize: typography.fontSize.xs, color: colors.textSecondary, marginBottom: 2 },
  value:  { fontSize: typography.fontSize.base, fontFamily: typography.family.bold, color: colors.textPrimary, textAlign: "center" },
  sub:    { fontSize: typography.fontSize.xs, color: colors.textSecondary },
});

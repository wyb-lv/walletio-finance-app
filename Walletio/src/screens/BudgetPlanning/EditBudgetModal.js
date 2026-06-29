import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ScrollView,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { upsertBudgetAllocation } from "../../store/slices/budgetSlice";
import Toast from "../../components/common/Toast";
import { LinearGradient } from "expo-linear-gradient";
import { colors, gradients, shadows } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { borderRadius, spacing } from "../../theme/spacing";

const COLORS = [
  colors.primary,
  colors.info,
  colors.accent,
  colors.clay,
  colors.expense,
  colors.secondaryDark,
  colors.earth,
];

export default function EditBudgetModal({ navigation, route }) {
  const dispatch = useDispatch();
  const { status } = useSelector((s) => s.budget);
  const budget = route?.params?.budget;

  const [limit, setLimit] = useState(String(budget?.limit ?? ""));
  const [color, setColor] = useState(budget?.color ?? COLORS[0]);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  const spentPct =
    budget?.limit > 0 ? Math.min(budget.spent / budget.limit, 1) : 0;

  const handleSave = async () => {
    if (!Number(limit)) return;
    if (!budget?.budgetId) {
      setToast({
        visible: true,
        message: "Backend chưa có budget cho phân bổ này.",
        type: "error",
      });
      return;
    }
    try {
      await dispatch(upsertBudgetAllocation({ ...budget, limit: Number(limit), color })).unwrap();
      setToast({
        visible: true,
        message: "Đã cập nhật ngân sách!",
        type: "success",
      });
      setTimeout(() => navigation.goBack(), 1200);
    } catch (error) {
      setToast({
        visible: true,
        message: error || "Không cập nhật được ngân sách.",
        type: "error",
      });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast((p) => ({ ...p, visible: false }))}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Chỉnh sửa ngân sách</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Category display */}
        <View
          style={[
            styles.catCard,
            { borderLeftColor: color, borderLeftWidth: 4 },
          ]}
        >
          <Text style={styles.catName}>{budget?.category}</Text>
          <Text style={styles.catGroup}>{budget?.groupTitle}</Text>

          {/* Progress */}
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${spentPct * 100}%`,
                  backgroundColor: spentPct > 0.9 ? colors.expense : color,
                },
              ]}
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.spentLabel}>
              Đã chi: {budget?.spent?.toLocaleString("vi-VN")}₫
            </Text>
            <Text style={styles.limitLabel}>{Math.round(spentPct * 100)}%</Text>
          </View>
        </View>

        <View style={styles.form}>
          {/* Hạn mức mới */}
          <Text style={styles.label}>Hạn mức mới (VNĐ/tháng)</Text>
          <View style={styles.amountRow}>
            <TextInput
              style={styles.amountInput}
              value={limit}
              onChangeText={setLimit}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
            />
            <Text style={styles.amountCurrency}>VNĐ</Text>
          </View>

          {/* Màu sắc */}
          <Text style={styles.label}>Màu sắc</Text>
          <View style={styles.colorRow}>
            {COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorDot,
                  { backgroundColor: c },
                  color === c && styles.colorSelected,
                ]}
                onPress={() => setColor(c)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.saveBtn, status === "pending" && { opacity: 0.6 }]}
        onPress={handleSave}
        disabled={status === "pending"}
      >
        <LinearGradient colors={gradients.forest} style={styles.saveGradient}>
          <Text style={styles.saveBtnText}>
            {status === "pending" ? "Đang cập nhật..." : "Lưu thay đổi"}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  closeBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.soft,
  },
  closeIcon: {
    fontSize: 14,
    color: colors.textPrimary,
    fontFamily: typography.family.semiBold,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.family.bold,
    color: colors.textPrimary,
  },
  catCard: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    marginTop: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  catName: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.family.bold,
    color: colors.textPrimary,
  },
  catGroup: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.base,
  },
  progressTrack: {
    height: 10,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 99,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressBar: { height: "100%", borderRadius: 99 },
  progressLabels: { flexDirection: "row", justifyContent: "space-between" },
  spentLabel: { fontSize: typography.fontSize.xs, color: colors.textSecondary },
  limitLabel: { fontSize: typography.fontSize.xs, color: colors.textSecondary },
  form: { paddingHorizontal: spacing.md },
  label: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.family.semiBold,
    color: colors.textSecondary,
    marginBottom: 6,
    marginTop: spacing.base,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingRight: spacing.base,
  },
  amountInput: {
    flex: 1,
    padding: spacing.base,
    fontSize: typography.fontSize.lg,
    color: colors.textPrimary,
    fontFamily: typography.family.bold,
  },
  amountCurrency: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  colorRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
  colorDot: { width: 36, height: 36, borderRadius: 18 },
  colorSelected: {
    borderWidth: 3,
    borderColor: colors.surface,
    ...shadows.soft,
  },
  saveBtn: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.full,
    overflow: "hidden",
    ...shadows.lifted,
  },
  saveGradient: {
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.md,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#fff",
    fontSize: typography.fontSize.base,
    fontFamily: typography.family.semiBold,
  },
});

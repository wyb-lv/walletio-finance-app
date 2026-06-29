import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, Alert, ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch } from "react-redux";
import { deleteTransaction } from "../../store/slices/transactionSlice";
import { fetchWallets, fetchWalletSummary } from "../../store/slices/walletSlice";
import Toast from "../../components/common/Toast";
import { colors, gradients, shadows } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { borderRadius, spacing } from "../../theme/spacing";

const CATEGORY_ICONS = {
  "Ăn uống": { emoji: "🍜", bg: "#F7E4BC" },
  "Nhà cửa": { emoji: "🏠", bg: "#E8F4DC" },
  "Di chuyển": { emoji: "🚗", bg: "#DDEFF5" },
  "Giải trí": { emoji: "🎮", bg: "#FBE7E0" },
  "Mua sắm": { emoji: "🛍️", bg: "#F4E8D8" },
  "Lương": { emoji: "💼", bg: "#DFF4E8" },
  "Thưởng": { emoji: "🎁", bg: "#E8F4DC" },
  "Sức khoẻ": { emoji: "💊", bg: "#DFF4E8" },
  "Giáo dục": { emoji: "📚", bg: "#E1F2F1" },
  "Khác": { emoji: "📦", bg: "#EEF5EA" },
  "default": { emoji: "💰", bg: "#EEF5EA" },
};

export default function TransactionDetail({ navigation, route }) {
  const dispatch    = useDispatch();
  const transaction = route?.params?.transaction;
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  if (!transaction) {
    return (
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Text>✕</Text>
        </TouchableOpacity>
        <Text style={{ textAlign: "center", marginTop: 40 }}>Không tìm thấy giao dịch</Text>
      </SafeAreaView>
    );
  }

  const icon      = CATEGORY_ICONS[transaction.category] ?? CATEGORY_ICONS["default"];
  const isIncome  = transaction.type === "income";
  const amtColor  = isIncome ? colors.income : colors.expense;
  const amtPrefix = isIncome ? "+" : "-";

  const handleDelete = () => {
    Alert.alert(
      "Xoá giao dịch",
      `Bạn có chắc muốn xoá "${transaction.description}"?`,
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Xoá",
          style: "destructive",
          onPress: async () => {
            try {
              await dispatch(deleteTransaction(transaction.id)).unwrap();
              dispatch(fetchWallets());
              dispatch(fetchWalletSummary());
              setToast({ visible: true, message: "Đã xoá giao dịch!", type: "success" });
              setTimeout(() => navigation.goBack(), 1200);
            } catch (error) {
              setToast({
                visible: true,
                message: error || "Không xoá được giao dịch.",
                type: "error",
              });
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    navigation.navigate("CreateTransaction", {
      initialType: transaction.type,
      editData:    transaction,
    });
  };

  const INFO_ROWS = [
    { label: "Danh mục",      value: transaction.category },
    { label: "Ví tiền",       value: transaction.walletId ?? "Tiền mặt" },
    { label: "Ngày",          value: transaction.date },
    { label: "Loại giao dịch",value: isIncome ? "Thu nhập" : "Chi phí" },
    ...(transaction.note ? [{ label: "Ghi chú", value: transaction.note }] : []),
  ];

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
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Chi tiết giao dịch</Text>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteIcon}>🗑</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Amount hero */}
        <LinearGradient colors={isIncome ? gradients.income : gradients.expense} style={[styles.heroCard, { borderColor: amtColor }]}>
          <View style={[styles.iconWrap, { backgroundColor: icon.bg }]}>
            <Text style={styles.iconEmoji}>{icon.emoji}</Text>
          </View>
          <Text style={styles.description}>{transaction.description}</Text>
          <Text style={[styles.amount, { color: amtColor }]}>
            {amtPrefix}{Math.abs(transaction.amount).toLocaleString("vi-VN")} ₫
          </Text>
          <View style={[styles.typeBadge, { backgroundColor: amtColor + "20", borderColor: amtColor }]}>
            <Text style={[styles.typeBadgeText, { color: amtColor }]}>
              {isIncome ? "Thu nhập" : "Chi phí"}
            </Text>
          </View>
        </LinearGradient>

        {/* Info rows */}
        <View style={styles.infoCard}>
          {INFO_ROWS.map((row, i) => (
            <View key={i}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{row.label}</Text>
                <Text style={styles.infoValue}>{row.value}</Text>
              </View>
              {i < INFO_ROWS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* Edit button */}
        <TouchableOpacity style={styles.editBtn} onPress={handleEdit}>
          <Text style={styles.editBtnText}>✏️  Chỉnh sửa giao dịch</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.md },
  backBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface, justifyContent: "center", alignItems: "center", ...shadows.soft },
  backIcon:        { fontSize: 18 },
  title: { fontSize: typography.fontSize.lg, fontFamily: typography.family.bold, color: colors.textPrimary },
  deleteBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#FBEDE8", justifyContent: "center", alignItems: "center" },
  deleteIcon:      { fontSize: 16 },
  heroCard: { marginHorizontal: spacing.md, borderRadius: borderRadius.xxl, padding: spacing.lg, alignItems: "center", marginBottom: spacing.lg, borderWidth: 1.5, ...shadows.soft },
  iconWrap: { width: 76, height: 76, borderRadius: borderRadius.xl, justifyContent: "center", alignItems: "center", marginBottom: spacing.base },
  iconEmoji:       { fontSize: 36 },
  description: { fontSize: typography.fontSize.lg, fontFamily: typography.family.bold, color: colors.textPrimary, marginBottom: spacing.sm, textAlign: "center" },
  amount: { fontSize: 32, fontFamily: typography.family.bold, marginBottom: spacing.sm },
  typeBadge:       { paddingHorizontal: spacing.base, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  typeBadgeText: { fontSize: typography.fontSize.sm, fontFamily: typography.family.semiBold },
  infoCard: { marginHorizontal: spacing.md, backgroundColor: colors.surface, borderRadius: borderRadius.xl, paddingHorizontal: spacing.base, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border, ...shadows.soft },
  infoRow:         { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: spacing.base },
  infoLabel:       { fontSize: typography.fontSize.sm, color: colors.textSecondary },
  infoValue: { fontSize: typography.fontSize.md, fontFamily: typography.family.medium, color: colors.textPrimary, maxWidth: "60%", textAlign: "right" },
  divider: { height: 1, backgroundColor: colors.divider },
  editBtn: { marginHorizontal: spacing.md, marginBottom: spacing.lg, borderRadius: borderRadius.full, paddingVertical: spacing.base, paddingHorizontal: spacing.md, borderWidth: 1.5, borderColor: colors.primary, backgroundColor: colors.surfaceAlt, alignItems: "center" },
  editBtnText: { color: colors.primary, fontSize: typography.fontSize.md, fontFamily: typography.family.semiBold },
});

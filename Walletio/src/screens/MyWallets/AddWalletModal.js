import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addWallet, fetchWalletSummary } from "../../store/slices/walletSlice";
import Toast from "../../components/common/Toast";
import { LinearGradient } from "expo-linear-gradient";
import { colors, gradients, shadows } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { borderRadius, spacing } from "../../theme/spacing";

const WALLET_TYPES = [
  { key: "payment", label: "Ví thanh toán", emoji: "💵", icon: "cash-outline", color: colors.primary },
  {
    key: "tracking",
    label: "Ví theo dõi",
    emoji: "🏦",
    icon: "analytics-outline",
    color: colors.info,
  },
];
const COLORS = [
  colors.primary,
  colors.info,
  colors.accent,
  colors.clay,
  colors.expense,
  colors.secondaryDark,
  colors.earth,
];

export default function AddWalletModal({ navigation }) {
  const dispatch = useDispatch();
  const { status } = useSelector((s) => s.wallets);

  const [name, setName] = useState("");
  const [balance, setBalance] = useState("0");
  const [type, setType] = useState("payment");
  const [color, setColor] = useState(COLORS[0]);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên ví.");
      return;
    }
    if (Number(balance) < 0) {
      Alert.alert("Lỗi", "Số dư không được âm.");
      return;
    }

    try {
      const walletType = WALLET_TYPES.find((t) => t.key === type);
      await dispatch(
        addWallet({
          name: name.trim(),
          openingBalance: Number(balance),
          type,
          color,
          icon: walletType?.icon ?? "wallet-outline",
          label: walletType?.label ?? name,
        }),
      ).unwrap();
      dispatch(fetchWalletSummary());

      setToast({
        visible: true,
        message: `Đã thêm ví "${name.trim()}"!`,
        type: "success",
      });
      setTimeout(() => navigation.goBack(), 1200);
    } catch (error) {
      Alert.alert("Không tạo được ví", error || "Vui lòng thử lại.");
    }
  };

  const selectedType = WALLET_TYPES.find((t) => t.key === type);

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
        <Text style={styles.title}>Thêm ví mới</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Icon preview */}
        <View style={styles.previewWrap}>
          <View style={[styles.previewIcon, { backgroundColor: color + "33" }]}>
            <Text style={styles.previewEmoji}>{selectedType?.emoji}</Text>
          </View>
          <Text style={styles.previewName}>{name || "Tên ví"}</Text>
        </View>

        <View style={styles.form}>
          {/* Tên ví */}
          <Text style={styles.label}>Tên ví</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập tên ví..."
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
            maxLength={30}
          />

          {/* Số dư ban đầu */}
          <Text style={styles.label}>Số dư ban đầu</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor={colors.textSecondary}
            value={balance}
            onChangeText={setBalance}
            keyboardType="numeric"
          />

          {/* Loại ví */}
          <Text style={styles.label}>Loại ví</Text>
          <View style={styles.typeRow}>
            {WALLET_TYPES.map((t) => (
              <TouchableOpacity
                key={t.key}
                style={[
                  styles.typeBtn,
                  type === t.key && {
                    borderColor: t.color,
                    backgroundColor: t.color + "15",
                  },
                ]}
                onPress={() => {
                  setType(t.key);
                  setColor(t.color);
                }}
              >
                <Text style={styles.typeEmoji}>{t.emoji}</Text>
                <Text
                  style={[
                    styles.typeLabel,
                    type === t.key && {
                      color: t.color,
                      fontFamily: typography.family.semiBold,
                    },
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Save button */}
      <TouchableOpacity
        style={[styles.saveBtn, status === "pending" && { opacity: 0.6 }]}
        onPress={handleSave}
        disabled={status === "pending"}
      >
        <LinearGradient colors={gradients.forest} style={styles.saveGradient}>
          <Text style={styles.saveBtnText}>
            {status === "pending" ? "Đang lưu..." : "Tạo ví"}
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
  previewWrap: { alignItems: "center", paddingVertical: spacing.lg },
  previewIcon: {
    width: 88,
    height: 88,
    borderRadius: borderRadius.xxl,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  previewEmoji: { fontSize: 36 },
  previewName: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.family.bold,
    color: colors.textPrimary,
  },
  form: { paddingHorizontal: spacing.md, paddingBottom: spacing.base },
  label: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.family.semiBold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.base,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeRow: { gap: spacing.sm },
  typeBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: spacing.xs,
    backgroundColor: colors.surface,
  },
  typeEmoji: { fontSize: 22, marginRight: spacing.base },
  typeLabel: {
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
    fontFamily: typography.family.medium,
  },
  colorRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
  colorDot: { width: 34, height: 34, borderRadius: 17 },
  colorDotSelected: {
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

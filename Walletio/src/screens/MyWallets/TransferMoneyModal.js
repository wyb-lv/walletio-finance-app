import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  TextInput,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchWallets, fetchWalletSummary } from "../../store/slices/walletSlice";
import { createTransfer } from "../../store/slices/transferSlice";
import WalletCard from "../../components/common/WalletCard";
import BottomSheet from "../../components/common/BottomSheet";
import Toast from "../../components/common/Toast";
import { LinearGradient } from "expo-linear-gradient";
import { colors, gradients, shadows } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { borderRadius, spacing } from "../../theme/spacing";

export default function TransferMoneyModal({ navigation, route }) {
  const dispatch = useDispatch();
  const wallets = useSelector((s) => s.wallets.wallets);
  const { status } = useSelector((s) => s.transfers);

  const [fromId, setFromId] = useState(route?.params?.fromId ?? wallets[0]?.id ?? "");
  const [toId, setToId] = useState(wallets[1]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  const fromWallet = wallets.find((w) => w.id === fromId) ?? wallets[0];
  const toWallet = wallets.find((w) => w.id === toId) ?? wallets[1];

  const handleTransfer = async () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      Alert.alert("Lỗi", "Nhập số tiền cần chuyển.");
      return;
    }
    if (fromId === toId) {
      Alert.alert("Lỗi", "Ví nguồn và ví đích không được trùng.");
      return;
    }
    if (!fromWallet || !toWallet) {
      Alert.alert("Lỗi", "Vui lòng chọn đủ ví nguồn và ví đích.");
      return;
    }
    if (fromWallet.balance < amt) {
      Alert.alert("Lỗi", "Số dư ví nguồn không đủ.");
      return;
    }

    try {
      await dispatch(createTransfer({ fromId, toId, amount: amt, note: note.trim() })).unwrap();
      dispatch(fetchWallets());
      dispatch(fetchWalletSummary());
      setToast({
        visible: true,
        message: `Chuyển thành công ${amt.toLocaleString("vi-VN")}₫`,
        type: "success",
      });
      setTimeout(() => navigation.goBack(), 1200);
    } catch (e) {
      setToast({
        visible: true,
        message: e?.message ?? e ?? "Chuyển tiền thất bại",
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
        <Text style={styles.title}>Chuyển tiền</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {/* From / To visual */}
        <View style={styles.arrowRow}>
          {/* Ví nguồn */}
          <TouchableOpacity
            style={styles.walletBox}
            onPress={() => setShowFrom(true)}
          >
            <Text style={styles.boxLabel}>Từ ví</Text>
            <Text style={styles.boxName}>{fromWallet?.name}</Text>
            <Text style={styles.boxBalance}>
              {fromWallet?.balance.toLocaleString("vi-VN")}₫
            </Text>
          </TouchableOpacity>

          {/* Arrow */}
          <View style={styles.arrowWrap}>
            <Text style={styles.arrow}>→</Text>
          </View>

          {/* Ví đích */}
          <TouchableOpacity
            style={[styles.walletBox, { borderColor: colors.info }]}
            onPress={() => setShowTo(true)}
          >
            <Text style={styles.boxLabel}>Đến ví</Text>
            <Text style={styles.boxName}>{toWallet?.name}</Text>
            <Text style={styles.boxBalance}>
              {toWallet?.balance.toLocaleString("vi-VN")}₫
            </Text>
          </TouchableOpacity>
        </View>

        {/* Amount input */}
        <View style={styles.amountCard}>
          <Text style={styles.amtLabel}>Số tiền chuyển</Text>
          <TextInput
            style={styles.amtInput}
            placeholder="0"
            placeholderTextColor={colors.textSecondary}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
          <Text style={styles.amtCurrency}>VNĐ</Text>
        </View>

        {/* Note */}
        <View style={styles.noteCard}>
          <Text style={styles.noteEmoji}>📝</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="Ghi chú (tuỳ chọn)"
            placeholderTextColor={colors.textSecondary}
            value={note}
            onChangeText={setNote}
          />
        </View>
      </ScrollView>

      {/* Confirm button */}
      <TouchableOpacity
        style={[styles.confirmBtn, status === "pending" && { opacity: 0.6 }]}
        onPress={handleTransfer}
        disabled={status === "pending"}
      >
        <LinearGradient
          colors={gradients.forest}
          style={styles.confirmGradient}
        >
          <Text style={styles.confirmText}>
            {status === "pending"
              ? "Đang chuyển..."
              : "↔️  Xác nhận chuyển tiền"}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* From picker */}
      <BottomSheet
        visible={showFrom}
        onClose={() => setShowFrom(false)}
        title="Chọn ví nguồn"
        snapHeight={350}
      >
        <View style={{ paddingTop: spacing.sm }}>
          {wallets
            .filter((w) => w.id !== toId)
            .map((w) => (
              <TouchableOpacity
                key={w.id}
                onPress={() => {
                  setFromId(w.id);
                  setShowFrom(false);
                }}
              >
                <WalletCard
                  name={w.name}
                  balance={w.balance}
                  icon={w.icon}
                  color={w.color}
                  isDefault={w.isDefault}
                  selected={fromId === w.id}
                />
              </TouchableOpacity>
            ))}
        </View>
      </BottomSheet>

      {/* To picker */}
      <BottomSheet
        visible={showTo}
        onClose={() => setShowTo(false)}
        title="Chọn ví đích"
        snapHeight={350}
      >
        <View style={{ paddingTop: spacing.sm }}>
          {wallets
            .filter((w) => w.id !== fromId)
            .map((w) => (
              <TouchableOpacity
                key={w.id}
                onPress={() => {
                  setToId(w.id);
                  setShowTo(false);
                }}
              >
                <WalletCard
                  name={w.name}
                  balance={w.balance}
                  icon={w.icon}
                  color={w.color}
                  isDefault={w.isDefault}
                  selected={toId === w.id}
                />
              </TouchableOpacity>
            ))}
        </View>
      </BottomSheet>
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
  arrowRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  walletBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: "center",
    ...shadows.soft,
  },
  boxLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  boxName: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.family.bold,
    color: colors.textPrimary,
    textAlign: "center",
  },
  boxBalance: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    marginTop: 4,
  },
  arrowWrap: { paddingHorizontal: spacing.sm },
  arrow: { fontSize: 28, color: colors.primary },
  amountCard: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  amtLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  amtInput: {
    fontSize: 36,
    fontFamily: typography.family.bold,
    color: colors.textPrimary,
    textAlign: "center",
    minWidth: 120,
  },
  amtCurrency: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 4,
  },
  noteCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noteEmoji: { fontSize: 18, marginRight: spacing.base },
  noteInput: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
  },
  confirmBtn: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.full,
    overflow: "hidden",
    ...shadows.lifted,
  },
  confirmGradient: {
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.md,
    alignItems: "center",
  },
  confirmText: {
    color: "#fff",
    fontSize: typography.fontSize.base,
    fontFamily: typography.family.semiBold,
  },
});

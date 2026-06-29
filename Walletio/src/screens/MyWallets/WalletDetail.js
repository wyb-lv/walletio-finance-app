import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch, useSelector } from "react-redux";
import { deleteWallet, fetchWalletSummary } from "../../store/slices/walletSlice";
import TransactionItem from "../../components/common/TransactionItem";
import { colors, gradients, shadows } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { borderRadius, spacing } from "../../theme/spacing";
import { safeIonicon } from "../../utils/icons";

export default function WalletDetail({ navigation, route }) {
  const dispatch = useDispatch();
  const walletId = route?.params?.walletId;
  const wallet = useSelector((state) => state.wallets.wallets.find((item) => item.id === walletId));
  const transactions = useSelector((state) => state.transactions.transactions);
  const transfers = useSelector((state) => state.transfers.transfers);

  const walletTransactions = useMemo(
    () =>
      transactions
        .filter(
          (transaction) =>
            transaction.walletId === walletId ||
            (wallet?.name && transaction.walletName === wallet.name),
        )
        .slice(0, 5),
    [transactions, wallet?.name, walletId],
  );

  const walletTransfers = useMemo(
    () => transfers.filter((transfer) => transfer.fromId === walletId || transfer.toId === walletId).slice(0, 3),
    [transfers, walletId],
  );

  const handleDelete = () => {
    Alert.alert("Xoá ví", `Xoá ví "${wallet?.name}"?`, [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Xoá",
        style: "destructive",
        onPress: async () => {
          try {
            await dispatch(deleteWallet(wallet.id)).unwrap();
            dispatch(fetchWalletSummary());
            navigation.goBack();
          } catch (error) {
            Alert.alert("Không xoá được ví", error || "Vui lòng thử lại.");
          }
        },
      },
    ]);
  };

  if (!wallet) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerState}>
          <Text style={styles.emptyTitle}>Không tìm thấy ví</Text>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.actionText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Chi tiết ví</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate("EditWallet", { walletId: wallet.id })}>
          <Ionicons name="create-outline" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <LinearGradient colors={gradients.forest} style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name={safeIonicon(wallet.icon, "wallet-outline")} size={30} color={colors.textInverse} />
          </View>
          <Text style={styles.heroLabel}>{wallet.isDefault ? "Ví mặc định" : "Ví cá nhân"}</Text>
          <Text style={styles.heroName}>{wallet.name}</Text>
          <Text style={styles.heroAmount}>{wallet.balance.toLocaleString("vi-VN")} ₫</Text>
        </LinearGradient>

        <View style={styles.quickRow}>
          <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate("CreateTransaction", { walletId: wallet.id })}>
            <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
            <Text style={styles.quickText}>Giao dịch</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate("TransferMoney", { fromId: wallet.id })}>
            <Ionicons name="swap-horizontal-outline" size={22} color={colors.info} />
            <Text style={styles.quickText}>Chuyển tiền</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={22} color={colors.error} />
            <Text style={styles.quickText}>Xoá</Text>
          </TouchableOpacity>
        </View>

        {/* <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Giao dịch gần đây</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Transactions")}>
            <Text style={styles.linkText}>Tất cả</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          {walletTransactions.length > 0 ? (
            walletTransactions.map((transaction) => (
              <TransactionItem key={transaction.id} {...transaction} date={transaction.date} />
            ))
          ) : (
            <Text style={styles.emptyText}>Chưa có giao dịch trong ví này.</Text>
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Chuyển tiền</Text>
          <TouchableOpacity onPress={() => navigation.navigate("TransferHistory", { walletId: wallet.id })}>
            <Text style={styles.linkText}>Lịch sử</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          {walletTransfers.length > 0 ? (
            walletTransfers.map((transfer) => {
              const isOut = transfer.fromId === wallet.id;
              return (
                <View key={transfer.id} style={styles.transferRow}>
                  <View style={[styles.transferIcon, { backgroundColor: isOut ? "#FBEDE8" : "#F0FAF3" }]}>
                    <Ionicons name={isOut ? "arrow-up-outline" : "arrow-down-outline"} size={18} color={isOut ? colors.expense : colors.income} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.transferTitle}>{isOut ? "Chuyển đi" : "Nhận về"}</Text>
                    <Text style={styles.transferDate}>{transfer.date}</Text>
                  </View>
                  <Text style={[styles.transferAmount, { color: isOut ? colors.expense : colors.income }]}>
                    {isOut ? "-" : "+"}{transfer.amount.toLocaleString("vi-VN")}₫
                  </Text>
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyText}>Chưa có chuyển tiền liên quan.</Text>
          )}
        </View> */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.md },
  iconBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: colors.border, ...shadows.soft },
  title: { fontSize: typography.fontSize.lg, fontFamily: typography.family.bold, color: colors.textPrimary },
  content: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  hero: { borderRadius: borderRadius.xxl, padding: spacing.lg, alignItems: "center", marginBottom: spacing.lg, ...shadows.lifted },
  heroIcon: { width: 62, height: 62, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.18)", justifyContent: "center", alignItems: "center", marginBottom: spacing.sm },
  heroLabel: { color: "rgba(255,255,255,0.74)", fontSize: typography.fontSize.sm, fontFamily: typography.family.medium },
  heroName: { color: colors.textInverse, fontSize: typography.fontSize.xl, fontFamily: typography.family.bold, marginTop: spacing.xs },
  heroAmount: { color: colors.textInverse, fontSize: typography.fontSize.huge, fontFamily: typography.family.bold, marginTop: spacing.sm, textAlign: "center" },
  quickRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg },
  quickBtn: { flex: 1, backgroundColor: colors.surface, borderRadius: borderRadius.lg, paddingVertical: spacing.base, alignItems: "center", borderWidth: 1, borderColor: colors.border, ...shadows.soft },
  quickText: { marginTop: spacing.xs, fontSize: typography.fontSize.sm, fontFamily: typography.family.semiBold, color: colors.textPrimary },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.sm },
  sectionTitle: { fontSize: typography.fontSize.lg, fontFamily: typography.family.bold, color: colors.textPrimary },
  linkText: { color: colors.primary, fontFamily: typography.family.semiBold, fontSize: typography.fontSize.sm },
  card: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, paddingHorizontal: spacing.base, paddingVertical: spacing.xs, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg, ...shadows.soft },
  transferRow: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.sm },
  transferIcon: { width: 42, height: 42, borderRadius: 16, justifyContent: "center", alignItems: "center", marginRight: spacing.sm },
  transferTitle: { fontSize: typography.fontSize.md, color: colors.textPrimary, fontFamily: typography.family.semiBold },
  transferDate: { fontSize: typography.fontSize.xs, color: colors.textMuted, marginTop: 3 },
  transferAmount: { fontSize: typography.fontSize.md, fontFamily: typography.family.bold },
  emptyText: { color: colors.textSecondary, textAlign: "center", paddingVertical: spacing.base, fontFamily: typography.family.medium },
  centerState: { flex: 1, justifyContent: "center", alignItems: "center", padding: spacing.md },
  emptyTitle: { fontSize: typography.fontSize.lg, fontFamily: typography.family.bold, color: colors.textPrimary, marginBottom: spacing.base },
  actionBtn: { backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: borderRadius.full },
  actionText: { color: colors.textInverse, fontFamily: typography.family.bold },
});

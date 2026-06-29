import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { deleteTransfer } from "../../store/slices/transferSlice";
import { colors, shadows } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { borderRadius, spacing } from "../../theme/spacing";

export default function TransferHistory({ navigation, route }) {
  const dispatch = useDispatch();
  const walletId = route?.params?.walletId;
  const wallets = useSelector((state) => state.wallets.wallets);
  const transfers = useSelector((state) => state.transfers.transfers);

  const visibleTransfers = useMemo(
    () => walletId
      ? transfers.filter((transfer) => transfer.fromId === walletId || transfer.toId === walletId)
      : transfers,
    [transfers, walletId],
  );

  const walletName = (id) => wallets.find((wallet) => wallet.id === id)?.name || "Ví đã xoá";

  const handleDelete = (transfer) => {
    Alert.alert("Xoá chuyển tiền", "Xoá bản ghi chuyển tiền?", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Xoá",
        style: "destructive",
        onPress: async () => {
          try {
            await dispatch(deleteTransfer(transfer.id)).unwrap();
          } catch (error) {
            Alert.alert("Không xoá được chuyển tiền", error || "Vui lòng thử lại.");
          }
        },
      },
    ]);
  };

  const renderTransfer = ({ item }) => (
    <TouchableOpacity style={styles.row} activeOpacity={0.8} onLongPress={() => handleDelete(item)}>
      <View style={styles.swapIcon}>
        <Ionicons name="swap-horizontal-outline" size={22} color={colors.info} />
      </View>
      <View style={styles.info}>
        <Text style={styles.titleText}>{walletName(item.fromId)} → {walletName(item.toId)}</Text>
        <Text style={styles.metaText}>{item.date}{item.note ? ` · ${item.note}` : ""}</Text>
      </View>
      <Text style={styles.amount}>{item.amount.toLocaleString("vi-VN")}₫</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử chuyển tiền</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate("TransferMoney")}>
          <Ionicons name="add" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={visibleTransfers}
        keyExtractor={(item) => item.id}
        renderItem={renderTransfer}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="swap-horizontal-outline" size={34} color={colors.textMuted} />
            <Text style={styles.emptyText}>Chưa có lịch sử chuyển tiền.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.md },
  iconBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: colors.border, ...shadows.soft },
  headerTitle: { fontSize: typography.fontSize.lg, fontFamily: typography.family.bold, color: colors.textPrimary },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.base, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, ...shadows.soft },
  swapIcon: { width: 46, height: 46, borderRadius: 18, backgroundColor: "#DDEFF5", justifyContent: "center", alignItems: "center", marginRight: spacing.base },
  info: { flex: 1, paddingRight: spacing.sm },
  titleText: { fontSize: typography.fontSize.md, color: colors.textPrimary, fontFamily: typography.family.semiBold },
  metaText: { fontSize: typography.fontSize.xs, color: colors.textSecondary, marginTop: 4 },
  amount: { fontSize: typography.fontSize.md, color: colors.textPrimary, fontFamily: typography.family.bold },
  empty: { alignItems: "center", backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.xl, borderWidth: 1, borderColor: colors.border },
  emptyText: { color: colors.textSecondary, marginTop: spacing.sm, fontFamily: typography.family.medium },
});

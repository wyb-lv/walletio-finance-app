import React, { useState, useMemo } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, TextInput, Alert,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSelector, useDispatch } from "react-redux";
import { deleteTransaction } from "../../store/slices/transactionSlice";
import { fetchWallets, fetchWalletSummary } from "../../store/slices/walletSlice";
import TransactionItem from "../../components/common/TransactionItem";
import { colors, shadows } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { borderRadius, spacing } from "../../theme/spacing";

const FILTERS = ["Tháng này", "Hàng tuần", "Tất cả"];

function groupByDate(transactions) {
  const groups = {};
  transactions.forEach((t) => {
    if (!groups[t.date]) groups[t.date] = [];
    groups[t.date].push(t);
  });
  // Chuyển thành mảng section
  return Object.entries(groups)
    .sort(([a], [b]) => {
      const parse = (s) => {
        const [d, m, y] = s.split("/");
        return new Date(parseInt(y), parseInt(m) - 1, parseInt(d)).getTime();
      };
      return parse(b) - parse(a);
    })
    .map(([date, items]) => ({ date, items }));
}

export default function Transactions({ navigation }) {
  const dispatch      = useDispatch();
  const transactions  = useSelector((s) => s.transactions.transactions);

  const [filter, setFilter] = useState("Tháng này");
  const [search, setSearch] = useState("");

  const now = new Date();

  const filtered = useMemo(() => {
    let list = [...transactions];

    // Filter theo period
    if (filter === "Tháng này") {
      list = list.filter((t) => {
        const [, m, y] = t.date.split("/");
        return parseInt(m) === now.getMonth() + 1 && parseInt(y) === now.getFullYear();
      });
    } else if (filter === "Hàng tuần") {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      list = list.filter((t) => {
        const [d, m, y] = t.date.split("/");
        const txDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        return txDate >= weekAgo;
      });
    }

    // Filter theo search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.description?.toLowerCase().includes(q) ||
          t.category?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [transactions, filter, search]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  // Tổng chi/thu trong kết quả hiện tại
  const totalExpense = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const totalIncome  = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);

  const handleDelete = (tx) => {
    Alert.alert(
      "Xoá giao dịch",
      `Bạn có chắc muốn xoá "${tx.description}"?`,
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Xoá",
          style: "destructive",
          onPress: async () => {
            try {
              await dispatch(deleteTransaction(tx.id)).unwrap();
              dispatch(fetchWallets());
              dispatch(fetchWalletSummary());
            } catch (error) {
              Alert.alert("Không xoá được giao dịch", error || "Vui lòng thử lại.");
            }
          },
        },
      ]
    );
  };

  const renderSection = ({ item: section }) => (
    <View style={styles.section}>
      <Text style={styles.dateHeader}>{section.date}</Text>
      <View style={styles.sectionCard}>
        {section.items.map((tx, i) => (
          <View key={tx.id}>
            <TouchableOpacity
              onPress={() => navigation.navigate("TransactionDetail", { transaction: tx })}
              onLongPress={() => handleDelete(tx)}
              activeOpacity={0.7}
            >
              <TransactionItem
                description={tx.description}
                category={tx.category}
                amount={tx.amount}
                type={tx.type}
                date=""
              />
            </TouchableOpacity>
            {i < section.items.length - 1 && <View style={styles.sep} />}
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(420)} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Lịch sử giao dịch</Text>
        <View style={{ width: 36 }} />
      </Animated.View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: "#F0FAF3" }]}>
          <Text style={styles.sumLabel}>Thu</Text>
          <Text style={[styles.sumValue, { color: colors.income }]}>
            +{(totalIncome / 1000).toLocaleString("vi-VN")}₫
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: "#FBEDE8" }]}>
          <Text style={styles.sumLabel}>Chi</Text>
          <Text style={[styles.sumValue, { color: colors.expense }]}>
            -{(totalExpense / 1000).toLocaleString("vi-VN")}₫
          </Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm giao dịch..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
        {!!search && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Text style={{ color: colors.textSecondary, fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List grouped by date */}
      {grouped.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={styles.emptyText}>Không có giao dịch nào</Text>
        </View>
      ) : (
        <FlatList
          data={grouped}
          keyExtractor={(item) => item.date}
          renderItem={renderSection}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.md },
  backBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface, justifyContent: "center", alignItems: "center", ...shadows.soft },
  backIcon: { fontSize: 18, color: colors.textPrimary },
  title: { fontSize: typography.fontSize.lg, fontFamily: typography.family.bold, color: colors.textPrimary },
  summaryRow: { flexDirection: "row", paddingHorizontal: spacing.md, gap: spacing.sm, marginBottom: spacing.md },
  summaryCard: { flex: 1, borderRadius: borderRadius.xl, padding: spacing.base, borderWidth: 1, borderColor: colors.border, ...shadows.soft },
  sumLabel: { fontSize: typography.fontSize.xs, color: colors.textSecondary, fontFamily: typography.family.medium },
  sumValue: { fontSize: typography.fontSize.base, fontFamily: typography.family.bold, marginTop: 4 },
  searchRow: { flexDirection: "row", alignItems: "center", marginHorizontal: spacing.md, backgroundColor: colors.surface, borderRadius: borderRadius.full, paddingHorizontal: spacing.base, paddingVertical: spacing.sm, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, ...shadows.soft },
  searchIcon:       { fontSize: 16, marginRight: spacing.sm },
  searchInput:      { flex: 1, fontSize: typography.fontSize.md, color: colors.textPrimary, paddingVertical: 0 },
  filterRow: { flexDirection: "row", paddingHorizontal: spacing.md, gap: spacing.sm, marginBottom: spacing.base },
  filterBtn: { paddingHorizontal: spacing.base, paddingVertical: spacing.xs, borderRadius: borderRadius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  filterActive:     { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: typography.fontSize.sm, color: colors.textSecondary, fontFamily: typography.family.medium },
  filterTextActive: { color: "#fff" },
  section: { paddingHorizontal: spacing.md, marginBottom: spacing.base },
  dateHeader: { fontSize: typography.fontSize.sm, fontFamily: typography.family.semiBold, color: colors.textSecondary, marginBottom: spacing.xs },
  sectionCard: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, paddingHorizontal: spacing.base, paddingVertical: spacing.xs, borderWidth: 1, borderColor: colors.border, ...shadows.soft },
  sep: { height: 1, backgroundColor: colors.divider },
  empty:            { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 },
  emptyEmoji:       { fontSize: 48, marginBottom: spacing.base },
  emptyText:        { fontSize: typography.fontSize.md, color: colors.textSecondary },
});

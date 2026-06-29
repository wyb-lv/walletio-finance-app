import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import BottomSheet from "../../components/common/BottomSheet";
import { ExpenseHistoryRow } from "./components/ExpenseHistorySection";
import {
  enrichExpenses,
  formatMonthKey,
  getExpenseMonthKey,
  parseExpenseDate,
} from "./utils/expenseHistory";
import { colors, shadows } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { borderRadius, spacing } from "../../theme/spacing";

const SORT_OPTIONS = [
  { key: "desc", label: "Gần nhất" },
  { key: "asc", label: "Xa nhất" },
];

export default function ExpenseHistory({ navigation }) {
  const transactions = useSelector((state) => state.transactions.transactions);
  const wallets = useSelector((state) => state.wallets.wallets);
  const categories = useSelector((state) => state.categories.categories);
  const emotions = useSelector((state) => state.emotions.emotions);

  const [search, setSearch] = useState("");
  const [monthKey, setMonthKey] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");
  const [walletId, setWalletId] = useState("all");
  const [activeFilter, setActiveFilter] = useState(null);

  const expenses = useMemo(
    () => enrichExpenses({ transactions, wallets, categories, emotions }),
    [categories, emotions, transactions, wallets],
  );

  const monthOptions = useMemo(() => {
    const unique = Array.from(
      new Set(expenses.map((expense) => getExpenseMonthKey(expense))),
    );
    return unique.sort((a, b) => (a < b ? 1 : -1));
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    const query = search.trim().toLowerCase();
    const selectedWallet = wallets.find((wallet) => wallet.id === walletId);
    return expenses
      .filter((expense) => {
        if (query) {
          const note = (expense.note || expense.description || "").toLowerCase();
          if (!note.includes(query)) return false;
        }
        if (monthKey !== "all" && getExpenseMonthKey(expense) !== monthKey) {
          return false;
        }
        if (
          walletId !== "all" &&
          expense.walletId !== walletId &&
          expense.walletName !== selectedWallet?.name
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        const aTime = parseExpenseDate(a.expense_date).getTime();
        const bTime = parseExpenseDate(b.expense_date).getTime();
        return sortOrder === "desc" ? bTime - aTime : aTime - bTime;
      });
  }, [expenses, monthKey, search, sortOrder, walletId, wallets]);

  const monthFilterOptions = useMemo(
    () => [
      { key: "all", label: "Tất cả" },
      ...monthOptions.map((key) => ({ key, label: formatMonthKey(key) })),
    ],
    [monthOptions],
  );

  const walletFilterOptions = useMemo(
    () => [
      { key: "all", label: "Tất cả ví" },
      ...wallets.map((wallet) => ({ key: wallet.id, label: wallet.name })),
    ],
    [wallets],
  );

  const selectedMonthLabel =
    monthFilterOptions.find((option) => option.key === monthKey)?.label ??
    "Tất cả";
  const selectedSortLabel =
    SORT_OPTIONS.find((option) => option.key === sortOrder)?.label ?? "Gần nhất";
  const selectedWalletLabel =
    walletFilterOptions.find((option) => option.key === walletId)?.label ??
    "Tất cả ví";

  const renderExpense = ({ item, index }) => (
    <View style={styles.itemWrap}>
      <ExpenseHistoryRow expense={item} />
      {index < filteredExpenses.length - 1 && <View style={styles.divider} />}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.78}
        >
          <Ionicons name="chevron-back" size={21} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Lịch sử giao dịch</Text>
        </View>
      </View>

      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm theo note..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
        {!!search && (
          <TouchableOpacity onPress={() => setSearch("")} activeOpacity={0.78}>
            <Ionicons name="close" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterGrid}>
        <FilterSelectButton
          label="Tháng năm"
          value={selectedMonthLabel}
          onPress={() => setActiveFilter("month")}
        />
        <FilterSelectButton
          label="Thời gian"
          value={selectedSortLabel}
          onPress={() => setActiveFilter("sort")}
        />
        <FilterSelectButton
          label="Ví tiền"
          value={selectedWalletLabel}
          onPress={() => setActiveFilter("wallet")}
        />
      </View>

      <View style={styles.listCard}>
        <FlatList
          data={filteredExpenses}
          keyExtractor={(item) => item.id}
          renderItem={renderExpense}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons
                name="receipt-outline"
                size={28}
                color={colors.textSecondary}
              />
              <Text style={styles.emptyText}>Không tìm thấy expense phù hợp.</Text>
            </View>
          }
        />
      </View>

      <FilterBottomSheet
        visible={activeFilter === "month"}
        title="Chọn tháng năm"
        options={monthFilterOptions}
        selectedKey={monthKey}
        onClose={() => setActiveFilter(null)}
        onSelect={(key) => {
          setMonthKey(key);
          setActiveFilter(null);
        }}
      />

      <FilterBottomSheet
        visible={activeFilter === "sort"}
        title="Sắp xếp thời gian"
        options={SORT_OPTIONS}
        selectedKey={sortOrder}
        onClose={() => setActiveFilter(null)}
        onSelect={(key) => {
          setSortOrder(key);
          setActiveFilter(null);
        }}
      />

      <FilterBottomSheet
        visible={activeFilter === "wallet"}
        title="Chọn ví tiền"
        options={walletFilterOptions}
        selectedKey={walletId}
        onClose={() => setActiveFilter(null)}
        onSelect={(key) => {
          setWalletId(key);
          setActiveFilter(null);
        }}
      />
    </SafeAreaView>
  );
}

function FilterSelectButton({ label, value, onPress }) {
  return (
    <TouchableOpacity
      style={styles.filterButton}
      onPress={onPress}
      activeOpacity={0.78}
    >
      <Text style={styles.filterButtonLabel}>{label}</Text>
      <View style={styles.filterButtonValueRow}>
        <Text style={styles.filterButtonValue} numberOfLines={1}>
          {value}
        </Text>
        <Ionicons
          name="chevron-down"
          size={15}
          color={colors.textSecondary}
        />
      </View>
    </TouchableOpacity>
  );
}

function FilterBottomSheet({
  visible,
  title,
  options,
  selectedKey,
  onSelect,
  onClose,
}) {
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={title}
      snapHeight={360}
    >
      <View style={styles.sheetOptions}>
        {options.map((option) => {
          const active = selectedKey === option.key;
          return (
            <TouchableOpacity
              key={option.key}
              style={[styles.optionRow, active && styles.optionRowActive]}
              onPress={() => onSelect(option.key)}
              activeOpacity={0.78}
            >
              <Text
                style={[styles.optionText, active && styles.optionTextActive]}
              >
                {option.label}
              </Text>
              {active && (
                <Ionicons name="checkmark" size={19} color={colors.primary} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.base,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  headerCopy: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.family.bold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  searchRow: {
    minHeight: 52,
    marginHorizontal: spacing.md,
    marginBottom: spacing.base,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.base,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    ...shadows.soft,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontFamily: typography.family.medium,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  filterGrid: {
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  filterButton: {
    minHeight: 52,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontFamily: typography.family.bold,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0,
    marginBottom: 4,
  },
  filterButtonValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  filterButtonValue: {
    flex: 1,
    minWidth: 0,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.family.bold,
    color: colors.textPrimary,
  },
  listCard: {
    flex: 1,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    ...shadows.soft,
  },
  listContent: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
    paddingBottom: spacing.xxl,
  },
  itemWrap: {},
  divider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  emptyState: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: spacing.xs,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.family.medium,
    color: colors.textSecondary,
    textAlign: "center",
  },
  sheetOptions: {
    paddingBottom: spacing.lg,
  },
  optionRow: {
    minHeight: 52,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.base,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionRowActive: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.primary,
  },
  optionText: {
    flex: 1,
    paddingRight: spacing.sm,
    fontSize: typography.fontSize.md,
    fontFamily: typography.family.semiBold,
    color: colors.textPrimary,
  },
  optionTextActive: {
    color: colors.primary,
  },
});

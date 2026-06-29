import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSelector } from "react-redux";
import { selectBudgetSummary } from "../../store/slices/budgetSlice";
import { selectExpenseByCategory } from "../../store/slices/transactionSlice";
import BudgetHeroCard from "./components/BudgetHeroCard";
import CategoryIcon from "../../components/common/CategoryIcon";
import { colors, shadows } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { borderRadius, spacing } from "../../theme/spacing";

const monthNames = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

const money = (value = 0) => `${Math.max(value, 0).toLocaleString("vi-VN")}đ`;
const signedMoney = (value = 0) =>
  `${value.toLocaleString("vi-VN", { maximumFractionDigits: 0 })}đ`;

export default function BudgetPlanning({ navigation }) {
  const now = new Date();
  const [selectedDate, setSelectedDate] = useState({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });

  const { month, year } = selectedDate;
  const wallets = useSelector((state) => state.wallets.wallets);
  const budgetSummary = useSelector((state) =>
    selectBudgetSummary(state, month, year),
  );
  const expenseByCategory = useSelector((state) =>
    selectExpenseByCategory(state, month, year),
  );
  const categories = useSelector((state) => state.categories.categories);
  const groups = useSelector((state) =>
    state.spendingGroups.groups.filter((group) => group.id !== "group_income"),
  );

  // The budget pool auto-sums the balance of every payment wallet, so money is
  // ready to allocate without manually setting a monthly budget amount.
  const paymentTotal = wallets
    .filter((wallet) => wallet.type === "payment")
    .reduce((sum, wallet) => sum + (wallet.balance ?? 0), 0);

  const allocated = budgetSummary.reduce(
    (sum, budget) => sum + (budget.limit ?? 0),
    0,
  );
  const unallocated = paymentTotal - allocated;

  const listData = useMemo(() => {
    const allocationByCategory = new Map(
      budgetSummary.map((budget) => [budget.categoryId, budget]),
    );
    const spentByCategory = new Map(
      expenseByCategory.map((category) => [category.name, category.amount]),
    );
    const rows = [];

    groups.forEach((group) => {
      const groupCategories = categories.filter(
        (category) => category.groupId === group.id,
      );
      rows.push({
        type: "group",
        id: group.id,
        group,
        categoryCount: groupCategories.length,
      });

      if (groupCategories.length === 0) {
        rows.push({
          type: "emptyGroup",
          id: `${group.id}_empty`,
          group,
        });
        return;
      }

      groupCategories.forEach((category) => {
        const budget = allocationByCategory.get(category.id);
        rows.push({
          type: "category",
          id: category.id,
          group,
          category,
          budget,
          allocated: budget?.limit ?? 0,
          spent: budget?.spent ?? spentByCategory.get(category.name) ?? 0,
          remaining:
            (budget?.limit ?? 0) -
            (budget?.spent ?? spentByCategory.get(category.name) ?? 0),
        });
      });
    });

    return rows;
  }, [budgetSummary, categories, expenseByCategory, groups]);

  const moveMonth = (direction) => {
    setSelectedDate((current) => {
      const date = new Date(current.year, current.month - 1 + direction, 1);
      return { month: date.getMonth() + 1, year: date.getFullYear() };
    });
  };

  const openAllocation = (category) => {
    navigation.navigate("AddBudget", {
      month,
      year,
      categoryId: category?.id,
    });
  };

  const openEditor = (groupId) => {
    navigation.navigate("BudgetStructureEditor", { month, year, groupId });
  };

  const renderHeader = () => (
    <View>
      <Animated.View
        entering={FadeInDown.duration(420)}
        style={styles.header}
      >
        <View style={styles.headerSpacer} />

        <View style={styles.titleBlock}>
          <Text style={styles.headerTitle}>Budget</Text>
        </View>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => openEditor()}
          activeOpacity={0.78}
        >
          <Ionicons name="create-outline" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(60).duration(420)}
        style={styles.monthPicker}
      >
        <TouchableOpacity
          style={styles.monthButton}
          onPress={() => moveMonth(-1)}
          activeOpacity={0.78}
        >
          <Ionicons name="chevron-back" size={18} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.monthLabelBox}>
          <Text style={styles.monthLabel}>
            {monthNames[month - 1]} {year}
          </Text>
          <Text style={styles.monthSubLabel}>Chọn tháng và năm</Text>
        </View>
        <TouchableOpacity
          style={styles.monthButton}
          onPress={() => moveMonth(1)}
          activeOpacity={0.78}
        >
          <Ionicons
            name="chevron-forward"
            size={18}
            color={colors.textPrimary}
          />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(520)}>
        <BudgetHeroCard
          allocated={allocated}
          unallocated={unallocated}
          onAllocate={() => openAllocation()}
          onEdit={() => openEditor()}
        />
      </Animated.View>
    </View>
  );

  const renderItem = ({ item }) => {
    if (item.type === "group") {
      return (
        <View style={styles.groupHeader}>
          <View style={[styles.groupIcon, { backgroundColor: `${item.group.color}18` }]}>
            <CategoryIcon icon={item.group.icon} size={18} color={item.group.color} fallback="albums-outline" />
          </View>
          <View style={styles.groupCopy}>
            <Text style={styles.groupTitle}>{item.group.title}</Text>
            <Text style={styles.groupMeta}>
              {item.categoryCount} danh mục
            </Text>
          </View>
        </View>
      );
    }

    if (item.type === "emptyGroup") {
      return (
        <TouchableOpacity
          style={styles.emptyGroupCard}
          onPress={() => openEditor(item.group.id)}
          activeOpacity={0.82}
        >
          <View style={styles.emptyIcon}>
            <Ionicons name="add" size={20} color={colors.primary} />
          </View>
          <View style={styles.emptyCopy}>
            <Text style={styles.emptyTitle}>Thêm danh mục</Text>
            <Text style={styles.emptyText}>
              {item.group.title} đang trống, tạo category đầu tiên cho đầu mục này.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      );
    }

    const percent =
      item.allocated > 0 ? Math.min(item.spent / item.allocated, 1) : 0;
    const remainingColor =
      item.remaining < 0 ? colors.expense : colors.textPrimary;

    return (
      <TouchableOpacity
        style={styles.categoryCard}
        onPress={() => openAllocation(item.category)}
        activeOpacity={0.82}
      >
        <View style={styles.categoryTop}>
          <View
            style={[
              styles.categoryIcon,
              { backgroundColor: `${item.category.color}18` },
            ]}
          >
            <CategoryIcon icon={item.category.icon} size={18} color={item.category.color} />
          </View>
          <View style={styles.categoryCopy}>
            <Text style={styles.categoryName}>{item.category.name}</Text>
            <Text style={styles.categoryStatus}>
              {item.allocated > 0 ? "Đã được giao tiền" : "Chưa phân bổ"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </View>

        <View style={styles.categoryMetrics}>
          <View style={styles.metricCell}>
            <Text style={styles.metricLabel}>Phân bổ</Text>
            <Text style={styles.metricValue}>{money(item.allocated)}</Text>
          </View>
          <View style={styles.metricCell}>
            <Text style={styles.metricLabel}>Đã tiêu</Text>
            <Text style={styles.metricValue}>{money(item.spent)}</Text>
          </View>
          <View style={styles.metricCell}>
            <Text style={styles.metricLabel}>Còn lại</Text>
            <Text style={[styles.metricValue, { color: remainingColor }]}>
              {signedMoney(item.remaining)}
            </Text>
          </View>
        </View>

        <View style={styles.categoryTrack}>
          <View
            style={[
              styles.categoryFill,
              {
                width: `${percent * 100}%`,
                backgroundColor:
                  item.remaining < 0 ? colors.expense : item.category.color,
              },
            ]}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={listData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  listContent: { paddingBottom: spacing.xxl },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  headerSpacer: { width: 42, height: 42 },
  titleBlock: { alignItems: "center" },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.family.bold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  monthPicker: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.base,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  monthButton: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceAlt,
    justifyContent: "center",
    alignItems: "center",
  },
  monthLabelBox: { alignItems: "center" },
  monthLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.family.bold,
    color: colors.textPrimary,
  },
  monthSubLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.family.medium,
    color: colors.textSecondary,
    marginTop: 2,
  },
  listIntro: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.family.bold,
    color: colors.textPrimary,
  },
  sectionHint: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.family.medium,
    color: colors.textSecondary,
    marginTop: 4,
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
  },
  groupIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  groupCopy: { flex: 1 },
  groupTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.family.bold,
    color: colors.textPrimary,
  },
  groupMeta: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.family.medium,
    color: colors.textSecondary,
    marginTop: 1,
  },
  categoryCard: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.base,
    ...shadows.soft,
  },
  categoryTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.base,
  },
  categoryIcon: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  categoryCopy: { flex: 1 },
  categoryName: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.family.bold,
    color: colors.textPrimary,
  },
  categoryStatus: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.family.medium,
    color: colors.textSecondary,
    marginTop: 2,
  },
  categoryMetrics: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  metricCell: {
    flex: 1,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceAlt,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  metricLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.family.medium,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.family.bold,
    color: colors.textPrimary,
  },
  categoryTrack: {
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceAlt,
    overflow: "hidden",
  },
  categoryFill: {
    height: "100%",
    borderRadius: borderRadius.full,
  },
  emptyGroupCard: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    padding: spacing.base,
    flexDirection: "row",
    alignItems: "center",
  },
  emptyIcon: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  emptyCopy: { flex: 1 },
  emptyTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.family.bold,
    color: colors.textPrimary,
  },
  emptyText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.family.medium,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 17,
  },
});

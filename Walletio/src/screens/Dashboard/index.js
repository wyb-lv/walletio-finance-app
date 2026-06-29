import React, { useEffect, useMemo } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSelector, useDispatch } from "react-redux";
import { fetchTransactions, selectMonthlySummary, selectExpenseByCategory } from "../../store/slices/transactionSlice";
import { fetchBudgets, selectMonthlyBudget, selectTotalBudgetLimit }      from "../../store/slices/budgetSlice";
import CircularProgress from "../../components/common/CircularProgress";
import CategoryRow      from "../../components/common/CategoryRow";
import { colors, gradients, shadows } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { borderRadius, spacing } from "../../theme/spacing";

export default function Dashboard({ navigation }) {
  const dispatch = useDispatch();
  const user     = useSelector((s) => s.auth.user);

  // Tháng hiện tại
  const now   = new Date();
  const month = now.getMonth() + 1;
  const year  = now.getFullYear();

  // Redux selectors
  const summary    = useSelector((s) => selectMonthlySummary(s, month, year));
  const totalLimit = useSelector((s) => selectTotalBudgetLimit(s));
  const monthlyBudget = useSelector((s) => selectMonthlyBudget(s, month, year));
  const catExpense = useSelector((s) => selectExpenseByCategory(s, month, year));

  useEffect(() => {
    dispatch(fetchTransactions());
    dispatch(fetchBudgets());
  }, []);

  // Tính greeting theo giờ
  const greeting = useMemo(() => {
    const h = now.getHours();
    if (h < 12) return "Chào buổi sáng,";
    if (h < 18) return "Chào buổi chiều,";
    return "Chào buổi tối,";
  }, []);

  const totalBudget = monthlyBudget.amount || totalLimit;
  const totalSpent  = summary.expense;
  const remaining   = totalBudget - totalSpent;
  const progress    = totalBudget > 0 ? totalSpent / totalBudget : 0;

  // Top 3 hạng mục chi tiêu nhiều nhất
  const topCategories = [...catExpense]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  // Budget theo category từ Redux
  const budgets = useSelector((s) => s.budget.budgets);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* ── Header ── */}
        <Animated.View entering={FadeInDown.duration(450)} style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.username}>{user?.name ?? "Người dùng"} 👋</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => navigation.navigate("AccountSettings")}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Budget card ── */}
        <Animated.View entering={FadeInUp.duration(520).springify()} style={styles.card}>
          <LinearGradient colors={gradients.forest} style={styles.cardGlow}>
          {/* Ngân sách tháng */}
          <View style={styles.monthRow}>
            <Text style={styles.monthLabel}>Ngân sách tháng {month}</Text>
            <TouchableOpacity onPress={() => navigation.navigate("BudgetPlanning")}>
              <Text style={styles.moreBtn}>···</Text>
            </TouchableOpacity>
          </View>

          {/* Circular + stats */}
          <View style={styles.circleRow}>
            <CircularProgress
              size={130}
              strokeWidth={13}
              progress={1 - Math.min(progress, 1)}
              centerLabel="Còn lại"
              centerValue={
                remaining >= 0
                  ? `${(remaining / 1000000).toFixed(1)}tr₫`
                  : `-${(Math.abs(remaining) / 1000000).toFixed(1)}tr₫`
              }
              color={remaining >= 0 ? "#F7E4BC" : colors.expense}
              trackColor="rgba(255,255,255,0.22)"
              textColor={colors.textInverse}
              labelColor="rgba(255,255,255,0.72)"
            />
            <View style={styles.statsCol}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Tổng ngân sách</Text>
                <Text style={styles.statValue}>
                  {(totalBudget / 1000).toLocaleString("vi-VN")}₫
                </Text>
              </View>
              <View style={[styles.statItem, { marginTop: spacing.base }]}>
                <Text style={styles.statLabel}>Đã chi tiêu</Text>
                <Text style={[styles.statValue, { color: colors.expense }]}>
                  {(totalSpent / 1000).toLocaleString("vi-VN")}₫
                </Text>
              </View>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "rgba(255,255,255,0.18)" }]}
              onPress={() => navigation.navigate("CreateTransaction", { initialType: "expense" })}
            >
              <Text style={styles.actionEmoji}>➖</Text>
              <Text style={styles.actionLabel}>Chi phí</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "rgba(255,255,255,0.18)" }]}
              onPress={() => navigation.navigate("CreateTransaction", { initialType: "income" })}
            >
              <Text style={styles.actionEmoji}>➕</Text>
              <Text style={styles.actionLabel}>Thu nhập</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "rgba(255,255,255,0.18)" }]}
              onPress={() => navigation.navigate("TransferMoney")}
            >
              <Text style={styles.actionEmoji}>↔️</Text>
              <Text style={styles.actionLabel}>Chuyển tiền</Text>
            </TouchableOpacity>
          </View>
          </LinearGradient>
        </Animated.View>

        {/* ── Chi tiêu theo hạng mục ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Chi tiêu theo hạng mục</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Transactions")}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.catCard}>
            {topCategories.length > 0 ? (
              topCategories.map((cat, i) => {
                const budget = budgets.find((b) => b.category === cat.name);
                return (
                  <CategoryRow
                    key={i}
                    name={cat.name}
                    amount={cat.amount}
                    budget={budget?.limit ?? 0}
                    showBar={false}
                    amountColor={colors.expense}
                  />
                );
              })
            ) : (
              <Text style={styles.emptyText}>Chưa có giao dịch trong tháng này</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: colors.background },
  // Header
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.md },
  greeting: { fontSize: typography.fontSize.sm, color: colors.textSecondary, fontFamily: typography.family.medium },
  username: { fontSize: typography.fontSize.xl, fontFamily: typography.family.bold, color: colors.textPrimary, marginTop: spacing.xxs },
  settingsBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface, justifyContent: "center", alignItems: "center", ...shadows.soft },
  settingsIcon: { fontSize: 16 },
  // Card
  card: { marginHorizontal: spacing.md, borderRadius: borderRadius.xxl, marginBottom: spacing.lg, overflow: "hidden", ...shadows.lifted },
  cardGlow: { padding: spacing.lg },
  monthRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md },
  monthLabel: { fontSize: typography.fontSize.md, fontFamily: typography.family.semiBold, color: colors.textInverse },
  moreBtn: { fontSize: 20, color: "rgba(255,255,255,0.78)", letterSpacing: 2 },
  // Circle row
  circleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.lg },
  statsCol: { flex: 1, paddingLeft: spacing.lg },
  statItem:     {},
  statLabel: { fontSize: typography.fontSize.xs, color: "rgba(255,255,255,0.72)", fontFamily: typography.family.medium },
  statValue: { fontSize: typography.fontSize.base, fontFamily: typography.family.bold, color: colors.textInverse, marginTop: 4 },
  // Actions
  actions: { flexDirection: "row", gap: spacing.sm },
  actionBtn: { flex: 1, alignItems: "center", paddingVertical: spacing.sm, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: "rgba(255,255,255,0.18)" },
  actionEmoji:  { fontSize: 18, marginBottom: 4 },
  actionLabel: { fontSize: typography.fontSize.xs, fontFamily: typography.family.semiBold, color: colors.textInverse },
  // Section
  section: { paddingHorizontal: spacing.md, marginBottom: spacing.lg },
  sectionHeader:{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  sectionTitle: { fontSize: typography.fontSize.lg, fontFamily: typography.family.bold, color: colors.textPrimary },
  seeAll: { fontSize: typography.fontSize.sm, color: colors.primary, fontFamily: typography.family.semiBold },
  catCard: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, paddingHorizontal: spacing.base, paddingVertical: spacing.xs, borderWidth: 1, borderColor: colors.border, ...shadows.soft },
  emptyText:    { textAlign: "center", color: colors.textSecondary, paddingVertical: spacing.base },
});

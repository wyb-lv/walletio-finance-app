import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle, G, Line, Rect, Text as SvgText } from "react-native-svg";
import { useDispatch, useSelector } from "react-redux";
import { fetchAnalyticsOverview, fetchAnalyticsSummary } from "../../store/slices/analyticSlice";
import { colors, shadows } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { borderRadius, spacing } from "../../theme/spacing";

const CHART_COLORS = ["#FBC13B", "#806000", "#37A657", "#2F7D5A", "#D8A85B", "#C78365", "#4E93B6"];
const INCOME_COLORS = ["#37A657", "#2F7D5A", "#8FBF8F", "#D8A85B"];
const MONEY_ZERO = "0đ";

const parseTxDate = (dateText) => {
  if (!dateText) return null;
  const [day, month, year] = dateText.split("/").map(Number);
  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day);
};

const formatMoney = (amount) => {
  if (!amount) return MONEY_ZERO;
  return `${Math.round(amount).toLocaleString("vi-VN")}đ`;
};

const formatAxisMoney = (amount) => {
  if (!amount) return "0";
  if (amount >= 1000000) {
    return `${Number((amount / 1000000).toFixed(1)).toLocaleString("vi-VN")}M`;
  }
  return `${Math.round(amount / 1000).toLocaleString("vi-VN")}K`;
};

const getMonthLabel = (date) => `Tháng ${date.getMonth() + 1} ${date.getFullYear()}`;
const getMonthShortLabel = (date) => `T${date.getMonth() + 1}`;
const getMonthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
const toApiDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const sameMonth = (date, monthDate) =>
  date && date.getMonth() === monthDate.getMonth() && date.getFullYear() === monthDate.getFullYear();

const getLastMonths = (date, count) =>
  Array.from({ length: count }, (_, index) => {
    const month = new Date(date.getFullYear(), date.getMonth() - (count - 1 - index), 1);
    return month;
  });

const buildCategoryRows = (transactions, palette) => {
  const total = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const grouped = transactions.reduce((acc, tx) => {
    const name = tx.category || "Khác";
    acc[name] = (acc[name] || 0) + tx.amount;
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([name, amount]) => ({
      name,
      amount,
      percent: total ? (amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
    .map((row, index) => ({
      ...row,
      color: palette[index % palette.length],
    }));
};

function DonutChart({ rows, total, label, size }) {
  const strokeWidth = Math.round(size * 0.16);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <View style={styles.donutWrap}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.surfaceAlt}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {rows.map((row) => {
            const dash = total ? (row.amount / total) * circumference : 0;
            const segment = (
              <Circle
                key={row.name}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={row.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dash} ${circumference}`}
                strokeDashoffset={-offset}
                fill="none"
              />
            );
            offset += dash;
            return segment;
          })}
        </G>
      </Svg>
      <View style={styles.donutCenter}>
        <Text style={styles.donutLabel}>{label}</Text>
        <Text style={styles.donutValue}>{formatMoney(total)}</Text>
      </View>
    </View>
  );
}

function CategoryRow({ row }) {
  return (
    <View style={styles.categoryRow}>
      <View style={styles.categoryNameWrap}>
        <View style={[styles.legendDot, { backgroundColor: row.color }]} />
        <Text style={styles.categoryName} numberOfLines={1}>
          {row.name}
        </Text>
      </View>
      <View style={styles.categoryValueWrap}>
        <View style={styles.percentBadge}>
          <Text style={styles.percentText}>{row.percent.toFixed(1)}%</Text>
        </View>
        <Text style={styles.categoryAmount}>{formatMoney(row.amount)}</Text>
      </View>
    </View>
  );
}

function ComparisonBars({ months, chartWidth }) {
  const chartHeight = 310;
  const plot = {
    top: 26,
    right: 10,
    bottom: 48,
    left: 58,
  };
  const plotWidth = chartWidth - plot.left - plot.right;
  const plotHeight = chartHeight - plot.top - plot.bottom;
  const maxValue = Math.max(...months.map((item) => Math.max(item.income, item.expense)), 1);
  const roundedMax = Math.ceil(maxValue / 1000000 / 5) * 5000000 || 1000000;
  const groupWidth = plotWidth / months.length;
  const barWidth = Math.min(18, groupWidth * 0.18);
  const yFor = (value) => plot.top + plotHeight - (value / roundedMax) * plotHeight;

  return (
    <Svg width={chartWidth} height={chartHeight}>
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
        const y = plot.top + plotHeight - ratio * plotHeight;
        return (
          <G key={ratio}>
            <Line x1={plot.left} x2={chartWidth - plot.right} y1={y} y2={y} stroke="#E2E0D8" strokeWidth={1} />
            <SvgText
              x={plot.left - 12}
              y={y + 5}
              textAnchor="end"
              fill={colors.textPrimary}
              fontSize="14"
              fontWeight="700"
            >
              {formatAxisMoney(roundedMax * ratio)}
            </SvgText>
          </G>
        );
      })}

      {months.map((item, index) => {
        const groupX = plot.left + groupWidth * index + groupWidth / 2;
        const incomeY = yFor(item.income);
        const expenseY = yFor(item.expense);
        const incomeHeight = plot.top + plotHeight - incomeY;
        const expenseHeight = plot.top + plotHeight - expenseY;

        return (
          <G key={item.label}>
            <Rect
              x={groupX - barWidth - 2}
              y={incomeY}
              width={barWidth}
              height={incomeHeight}
              rx={5}
              fill="#37A657"
            />
            <Rect
              x={groupX + 2}
              y={expenseY}
              width={barWidth}
              height={expenseHeight}
              rx={5}
              fill="#FBC13B"
            />
            <SvgText
              x={groupX}
              y={chartHeight - 14}
              textAnchor="middle"
              fill={colors.textPrimary}
              fontSize="16"
              fontWeight="800"
            >
              {item.label}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}

export default function Analytic() {
  const dispatch = useDispatch();
  const [metric, setMetric] = useState("expense");
  const [selectedMonth, setSelectedMonth] = useState(() => new Date());
  const transactions = useSelector((state) => state.transactions.transactions);
  const analytics = useSelector((state) => state.analytics);
  const { width } = useWindowDimensions();
  const pageWidth = Math.min(width, 430);
  const chartWidth = Math.max(240, pageWidth - spacing.md * 2 - spacing.base * 2);
  const donutSize = Math.min(280, chartWidth);
  const selectedYear = selectedMonth.getFullYear();
  const monthStart = useMemo(
    () => new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1),
    [selectedMonth],
  );
  const nextMonthStart = useMemo(
    () => new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1),
    [selectedMonth],
  );

  useEffect(() => {
    dispatch(fetchAnalyticsSummary(selectedYear));
  }, [dispatch, selectedYear]);

  useEffect(() => {
    dispatch(
      fetchAnalyticsOverview({
        direction: metric === "expense" ? "out" : "in",
        from: toApiDate(monthStart),
        to: toApiDate(nextMonthStart),
      }),
    );
  }, [dispatch, metric, monthStart, nextMonthStart]);

  const monthTransactions = useMemo(
    () => transactions.filter((tx) => sameMonth(parseTxDate(tx.date), selectedMonth)),
    [transactions, selectedMonth]
  );

  const expenseTransactions = monthTransactions.filter((tx) => tx.type === "expense");
  const incomeTransactions = monthTransactions.filter((tx) => tx.type === "income");
  const expenseRows = buildCategoryRows(expenseTransactions, CHART_COLORS);
  const incomeRows = buildCategoryRows(incomeTransactions, INCOME_COLORS);
  const apiOverviewMatches =
    analytics.overview?.direction === (metric === "expense" ? "out" : "in") &&
    analytics.overview?.from === toApiDate(monthStart) &&
    analytics.overview?.to === toApiDate(nextMonthStart);
  const apiRows = apiOverviewMatches
    ? analytics.overview.categories.map((row, index) => ({
        ...row,
        color: (metric === "expense" ? CHART_COLORS : INCOME_COLORS)[index % (metric === "expense" ? CHART_COLORS.length : INCOME_COLORS.length)],
      }))
    : [];
  const activeRows = apiRows.length > 0 ? apiRows : metric === "expense" ? expenseRows : incomeRows;
  const activeTotal = activeRows.reduce((sum, row) => sum + row.amount, 0);

  const lastThreeMonths = useMemo(() => getLastMonths(selectedMonth, 3), [selectedMonth]);
  const summaryMonths = analytics.summaries?.[selectedYear] ?? [];
  const summaryByMonth = new Map(summaryMonths.map((item) => [item.month, item]));
  const comparisonMonths = lastThreeMonths.map((monthDate) => {
    const apiMonth = summaryByMonth.get(getMonthKey(monthDate));
    const monthTxs = transactions.filter((tx) => sameMonth(parseTxDate(tx.date), monthDate));
    const localIncome = monthTxs
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + tx.amount, 0);
    const localExpense = monthTxs
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0);
    // Prefer locally loaded transactions: they update the moment a transaction is
    // added and stay consistent with the list and donut. The server summary is
    // only fetched at startup, so it can be stale (e.g. missing income added this
    // session); fall back to it only for months with no local transactions.
    return {
      label: getMonthShortLabel(monthDate),
      income: monthTxs.length ? localIncome : apiMonth?.income ?? 0,
      expense: monthTxs.length ? localExpense : apiMonth?.expense ?? 0,
    };
  });
  const averageIncome = comparisonMonths.reduce((sum, item) => sum + item.income, 0) / comparisonMonths.length;
  const averageExpense = comparisonMonths.reduce((sum, item) => sum + item.expense, 0) / comparisonMonths.length;

  const moveMonth = (direction) => {
    setSelectedMonth((current) => new Date(current.getFullYear(), current.getMonth() + direction, 1));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>Tổng quan</Text>

        <View style={styles.card}>
          <View style={styles.segmentRow}>
            <TouchableOpacity
              style={[styles.segmentButton, metric === "expense" && styles.segmentActive]}
              onPress={() => setMetric("expense")}
              activeOpacity={0.82}
            >
              <Text style={[styles.segmentText, metric === "expense" && styles.segmentTextActive]}>Chi tiêu</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segmentButton, metric === "income" && styles.segmentActive]}
              onPress={() => setMetric("income")}
              activeOpacity={0.82}
            >
              <Text style={[styles.segmentText, metric === "income" && styles.segmentTextActive]}>Thu nhập</Text>
            </TouchableOpacity>
            <View style={styles.filterIcon}>
              <Ionicons name="options-outline" size={24} color={colors.textPrimary} />
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>3</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.monthRow}>
            <TouchableOpacity style={styles.monthArrow} onPress={() => moveMonth(-1)}>
              <Ionicons name="caret-back" size={24} color={colors.textMuted} />
            </TouchableOpacity>
            <View style={styles.monthPill}>
              <Text style={styles.monthText}>{getMonthLabel(selectedMonth)}</Text>
              <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
            </View>
            <TouchableOpacity style={styles.monthArrow} onPress={() => moveMonth(1)}>
              <Ionicons name="caret-forward" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {activeTotal > 0 ? (
            <>
              <DonutChart
                rows={activeRows}
                total={activeTotal}
                label={metric === "expense" ? "Tổng chi tiêu" : "Tổng thu nhập"}
                size={donutSize}
              />
              <View style={styles.categoryList}>
                {activeRows.map((row) => (
                  <CategoryRow key={row.name} row={row} />
                ))}
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="pie-chart-outline" size={42} color={colors.textMuted} />
              <Text style={styles.emptyText}>Không có dữ liệu {metric === "expense" ? "chi tiêu" : "thu nhập"}</Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Chi tiêu so với thu nhập</Text>

        <View style={styles.card}>
          <View style={styles.compareHeader}>
            <View style={styles.legendGroup}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#FBC13B" }]} />
                <Text style={styles.legendLabel}>Chi tiêu</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#37A657" }]} />
                <Text style={styles.legendLabel}>Thu nhập</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.periodButton} activeOpacity={0.82}>
              <Text style={styles.periodText}>3 tháng gần đây</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.barChartWrap}>
            <ComparisonBars months={comparisonMonths} chartWidth={chartWidth} />
          </View>

          <View style={styles.averageBlock}>
            <Text style={styles.averageTitle}>Trung bình 3 tháng gần đây</Text>
            <View style={styles.averageRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#37A657" }]} />
                <Text style={styles.averageLabel}>Thu nhập</Text>
              </View>
              <Text style={styles.averageValue}>{formatMoney(averageIncome)}</Text>
            </View>
            <View style={styles.averageRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#FBC13B" }]} />
                <Text style={styles.averageLabel}>Chi tiêu</Text>
              </View>
              <Text style={styles.averageValue}>{formatMoney(averageExpense)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  screenTitle: {
    fontSize: typography.fontSize.huge,
    fontFamily: typography.family.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xxl,
    fontFamily: typography.family.bold,
    color: colors.textPrimary,
    marginTop: spacing.base,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.elevated,
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: "rgba(23, 54, 43, 0.05)",
    ...shadows.soft,
  },
  segmentRow: {
    minHeight: 70,
    borderRadius: borderRadius.xl,
    backgroundColor: "#FFFBE9",
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.xs,
    gap: spacing.xs,
  },
  segmentButton: {
    flex: 1,
    height: 46,
    borderRadius: borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentActive: { backgroundColor: "#FBC13B" },
  segmentText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.family.medium,
    color: colors.textPrimary,
  },
  segmentTextActive: { fontFamily: typography.family.bold },
  filterIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadge: {
    position: "absolute",
    top: 4,
    right: 5,
    width: 21,
    height: 21,
    borderRadius: 10.5,
    backgroundColor: "#FBC13B",
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: {
    color: colors.textInverse,
    fontFamily: typography.family.bold,
    fontSize: typography.fontSize.xs,
  },
  divider: { height: 1, backgroundColor: "#ECE9DF", marginTop: spacing.base, marginBottom: spacing.md },
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  monthArrow: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  monthPill: {
    minHeight: 44,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: "#DDDAD2",
    paddingHorizontal: spacing.base,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.elevated,
  },
  monthText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.family.medium,
    color: colors.textPrimary,
  },
  donutWrap: { alignSelf: "center", justifyContent: "center", alignItems: "center" },
  donutCenter: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  donutLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.family.medium,
    color: colors.textSecondary,
    textAlign: "center",
  },
  donutValue: {
    fontSize: typography.fontSize.xxl,
    fontFamily: typography.family.bold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  categoryList: { paddingHorizontal: spacing.base, paddingTop: spacing.lg, paddingBottom: spacing.sm, gap: spacing.base },
  categoryRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  categoryNameWrap: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: spacing.xs },
  legendDot: { width: 14, height: 14, borderRadius: 7 },
  categoryName: {
    flex: 1,
    minWidth: 0,
    fontSize: typography.fontSize.lg,
    fontFamily: typography.family.medium,
    color: colors.textPrimary,
  },
  categoryValueWrap: { alignItems: "flex-end", minWidth: 116 },
  percentBadge: {
    borderRadius: borderRadius.sm,
    backgroundColor: "#075E45",
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
    marginBottom: spacing.xs,
  },
  percentText: {
    color: colors.textInverse,
    fontFamily: typography.family.bold,
    fontSize: typography.fontSize.sm,
  },
  categoryAmount: {
    color: colors.textPrimary,
    fontFamily: typography.family.bold,
    fontSize: typography.fontSize.xl,
  },
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: spacing.xxxl },
  emptyText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontFamily: typography.family.medium,
    fontSize: typography.fontSize.md,
  },
  compareHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  legendGroup: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: spacing.base },
  legendItem: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  legendLabel: {
    color: colors.textPrimary,
    fontFamily: typography.family.medium,
    fontSize: typography.fontSize.base,
  },
  periodButton: {
    minHeight: 48,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: "#DDDAD2",
    paddingLeft: spacing.base,
    paddingRight: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.elevated,
  },
  periodText: {
    color: colors.textPrimary,
    fontFamily: typography.family.medium,
    fontSize: typography.fontSize.md,
  },
  barChartWrap: { alignItems: "center", paddingTop: spacing.sm, paddingBottom: spacing.lg },
  averageBlock: { paddingHorizontal: spacing.base, paddingBottom: spacing.sm, gap: spacing.base },
  averageTitle: {
    color: colors.textSecondary,
    fontFamily: typography.family.medium,
    fontSize: typography.fontSize.lg,
    marginBottom: spacing.xs,
  },
  averageRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.base },
  averageLabel: {
    color: colors.textPrimary,
    fontFamily: typography.family.medium,
    fontSize: typography.fontSize.xl,
  },
  averageValue: {
    color: colors.textPrimary,
    fontFamily: typography.family.bold,
    fontSize: typography.fontSize.xl,
  },
});

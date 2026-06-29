import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch, useSelector } from "react-redux";
import {
  selectMonthlyBudget,
  updateBudget,
} from "../../store/slices/budgetSlice";
import { addCategory } from "../../store/slices/categorySlice";
import { addSpendingGroup } from "../../store/slices/spendingGroupSlice";
import CategoryIcon from "../../components/common/CategoryIcon";
import Toast from "../../components/common/Toast";
import { colors, gradients, shadows } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { borderRadius, spacing } from "../../theme/spacing";
import { safeIonicon } from "../../utils/icons";

const COLORS = [
  colors.primary,
  colors.info,
  colors.accent,
  colors.clay,
  colors.expense,
  colors.secondaryDark,
  colors.earth,
];

const GROUP_ICONS = [
  "albums-outline",
  "shield-checkmark-outline",
  "sparkles-outline",
  "navigate-outline",
  "school-outline",
  "heart-outline",
];

const CATEGORY_ICONS = [
  "apps-outline",
  "restaurant-outline",
  "bag-outline",
  "car-outline",
  "home-outline",
  "game-controller-outline",
  "medkit-outline",
  "school-outline",
];

export default function BudgetStructureEditor({ navigation, route }) {
  const dispatch = useDispatch();
  const now = new Date();
  const month = route?.params?.month ?? now.getMonth() + 1;
  const year = route?.params?.year ?? now.getFullYear();
  const routeGroupId = route?.params?.groupId;

  const monthlyBudget = useSelector((state) =>
    selectMonthlyBudget(state, month, year),
  );
  const groups = useSelector((state) =>
    state.spendingGroups.groups.filter((group) => group.id !== "group_income"),
  );
  const categories = useSelector((state) => state.categories.categories);

  const [monthlyAmount, setMonthlyAmount] = useState(
    monthlyBudget.amount ? String(monthlyBudget.amount) : "",
  );
  const [groupTitle, setGroupTitle] = useState("");
  const [groupIcon, setGroupIcon] = useState(GROUP_ICONS[0]);
  const [groupColor, setGroupColor] = useState(COLORS[0]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryIcon, setCategoryIcon] = useState(CATEGORY_ICONS[0]);
  const [categoryColor, setCategoryColor] = useState(COLORS[1]);
  const [selectedGroupId, setSelectedGroupId] = useState(
    routeGroupId ?? groups[0]?.id ?? "",
  );
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  const saveMonthlyBudget = async () => {
    const amount = Number(monthlyAmount);
    if (!amount || amount <= 0) {
      Alert.alert("Thiếu ngân sách tháng", "Vui lòng nhập số tiền budget hợp lệ.");
      return;
    }
    if (!monthlyBudget.id) {
      Alert.alert("Chưa có budget", "Backend chưa có API tạo budget tháng mới từ mobile.");
      return;
    }
    try {
      await dispatch(
        updateBudget({
          id: monthlyBudget.id,
          name: monthlyBudget.name ?? `Budget ${month}/${year}`,
          month,
          year,
          amount,
        }),
      ).unwrap();
      setToast({
        visible: true,
        message: `Đã lưu budget tháng ${month}/${year}.`,
        type: "success",
      });
    } catch (error) {
      Alert.alert("Không lưu được budget", error || "Vui lòng thử lại.");
    }
  };

  const createGroup = async () => {
    const title = groupTitle.trim();
    if (!title) {
      Alert.alert("Thiếu tên đầu mục", "Vui lòng nhập tên spending group.");
      return;
    }
    try {
      await dispatch(addSpendingGroup({ title, icon: groupIcon, color: groupColor })).unwrap();
      setGroupTitle("");
      setToast({
        visible: true,
        message: `Đã tạo đầu mục "${title}".`,
        type: "success",
      });
    } catch (error) {
      Alert.alert("Không tạo được đầu mục", error || "Vui lòng thử lại.");
    }
  };

  const createCategory = async () => {
    const name = categoryName.trim();
    if (!name) {
      Alert.alert("Thiếu tên danh mục", "Vui lòng nhập tên category.");
      return;
    }
    if (!selectedGroupId) {
      Alert.alert("Thiếu đầu mục", "Vui lòng chọn spending group.");
      return;
    }

    try {
      await dispatch(
        addCategory({
          name,
          icon: categoryIcon,
          color: categoryColor,
          groupId: selectedGroupId,
        }),
      ).unwrap();
      setCategoryName("");
      setToast({
        visible: true,
        message: `Đã tạo danh mục "${name}".`,
        type: "success",
      });
    } catch (error) {
      Alert.alert("Không tạo được danh mục", error || "Vui lòng thử lại.");
    }
  };

  const groupCategoryCount = (groupId) =>
    categories.filter((category) => category.groupId === groupId).length;

  return (
    <SafeAreaView style={styles.safe}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.78}
        >
          <Ionicons name="close" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Chỉnh sửa ngân sách</Text>
        </View>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Spending group */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.panelTitle}>Tạo nhóm danh mục</Text>
            </View>
            <Ionicons name="albums-outline" size={24} color={colors.primaryDark} />
          </View>

          {/* <Text style={styles.label}>Tên đầu mục</Text> */}
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: Thiết yếu"
            placeholderTextColor={colors.textMuted}
            value={groupTitle}
            onChangeText={setGroupTitle}
          />

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={createGroup}
            activeOpacity={0.82}
          >
            <Ionicons name="add" size={19} color={colors.textInverse} />
            <Text style={styles.primaryButtonText}>Lưu</Text>
          </TouchableOpacity>
        </View>

        {/* Category */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.panelTitle}>Tạo danh mục</Text>
            </View>
            <Ionicons name="apps-outline" size={24} color={colors.primaryDark} />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Ví dụ: Tiền điện"
            placeholderTextColor={colors.textMuted}
            value={categoryName}
            onChangeText={setCategoryName}
          />

          <Text style={styles.label}>Thuộc nhóm danh mục</Text>
          <View style={styles.groupList}>
            {groups.map((group) => {
              const active = selectedGroupId === group.id;
              return (
                <TouchableOpacity
                  key={group.id}
                  style={[
                    styles.groupChoice,
                    active && {
                      borderColor: group.color,
                      backgroundColor: `${group.color}12`,
                    },
                  ]}
                  onPress={() => setSelectedGroupId(group.id)}
                  activeOpacity={0.78}
                >
                  <CategoryIcon
                    icon={group.icon}
                    size={17}
                    color={active ? group.color : colors.textSecondary}
                    fallback="albums-outline"
                  />
                  <Text
                    style={[
                      styles.groupChoiceText,
                      active && { color: group.color },
                    ]}
                    numberOfLines={1}
                  >
                    {group.title}
                  </Text>
                  <Text style={styles.groupCount}>
                    {groupCategoryCount(group.id)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Icon</Text>
          <View style={styles.optionRow}>
            {CATEGORY_ICONS.map((icon) => (
              <TouchableOpacity
                key={icon}
                style={[
                  styles.iconOption,
                  categoryIcon === icon && styles.optionSelected,
                ]}
                onPress={() => setCategoryIcon(icon)}
                activeOpacity={0.78}
              >
                <Ionicons
                  name={icon}
                  size={19}
                  color={
                    categoryIcon === icon ? colors.primary : colors.textSecondary
                  }
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Màu</Text>
          <View style={styles.optionRow}>
            {COLORS.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.colorDot,
                  { backgroundColor: item },
                  categoryColor === item && styles.colorSelected,
                ]}
                onPress={() => setCategoryColor(item)}
                activeOpacity={0.78}
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={createCategory}
            activeOpacity={0.82}
          >
            <Ionicons name="add" size={19} color={colors.textInverse} />
            <Text style={styles.primaryButtonText}>Tạo category</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  headerCopy: { alignItems: "center" },
  kicker: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.family.medium,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.family.bold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.base,
  },
  panel: {
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.base,
    ...shadows.soft,
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.base,
  },
  panelLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.family.medium,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0,
  },
  panelTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.family.bold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.family.semiBold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  input: {
    minHeight: 50,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.base,
    fontSize: typography.fontSize.base,
    fontFamily: typography.family.semiBold,
    color: colors.textPrimary,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingRight: spacing.base,
  },
  amountInput: {
    flex: 1,
    padding: spacing.base,
    fontSize: typography.fontSize.xl,
    color: colors.textPrimary,
    fontFamily: typography.family.bold,
  },
  amountCurrency: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontFamily: typography.family.semiBold,
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  iconOption: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: "rgba(47,125,90,0.12)",
  },
  colorDot: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.full,
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: colors.surface,
    ...shadows.soft,
  },
  secondaryButton: {
    marginTop: spacing.base,
    minHeight: 48,
    borderRadius: borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryDark,
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.family.bold,
    color: colors.textInverse,
  },
  primaryButton: {
    marginTop: spacing.base,
    minHeight: 50,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryDark,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  primaryButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.family.bold,
    color: colors.textInverse,
  },
  groupList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  groupChoice: {
    width: "48.5%",
    minHeight: 46,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
  },
  groupChoiceText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.family.bold,
    color: colors.textPrimary,
    marginHorizontal: spacing.xs,
  },
  groupCount: {
    minWidth: 24,
    textAlign: "right",
    fontSize: typography.fontSize.xs,
    fontFamily: typography.family.bold,
    color: colors.textSecondary,
  },
});

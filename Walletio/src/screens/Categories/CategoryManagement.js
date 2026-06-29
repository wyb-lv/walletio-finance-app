import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { addCategory } from "../../store/slices/categorySlice";
import CategoryIcon from "../../components/common/CategoryIcon";
import { colors, shadows } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { borderRadius, spacing } from "../../theme/spacing";
import { safeIonicon } from "../../utils/icons";

const COLORS = [colors.primary, colors.info, colors.accent, colors.clay, colors.expense, colors.secondaryDark, colors.earth];
const ICONS = ["restaurant-outline", "car-outline", "bag-outline", "home-outline", "briefcase-outline", "gift-outline", "school-outline", "apps-outline"];

export default function CategoryManagement({ navigation }) {
  const dispatch = useDispatch();
  const categories = useSelector((state) => state.categories.categories);
  const groups = useSelector((state) => state.spendingGroups.groups);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState(ICONS[0]);
  const [groupId, setGroupId] = useState(null);

  const resetForm = () => {
    setName("");
    setColor(COLORS[0]);
    setIcon(ICONS[0]);
    setGroupId(groups[0]?.id ?? null);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Thiếu tên", "Vui lòng nhập tên danh mục.");
      return;
    }
    try {
      await dispatch(addCategory({ name: name.trim(), color, icon, groupId })).unwrap();
      resetForm();
    } catch (error) {
      Alert.alert("Không lưu được danh mục", error || "Vui lòng thử lại.");
    }
  };

  const groupTitle = (id) => groups.find((group) => group.id === id)?.title || "Khác";

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý danh mục</Text>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.navigate("DeleteCategory")}
        >
          <Ionicons name="trash-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Thêm danh mục</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Tên danh mục"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.label}>Nhóm</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {groups.map((group) => {
              const active = groupId === group.id;
              return (
                <TouchableOpacity
                  key={group.id}
                  style={[styles.groupChip, active && { backgroundColor: `${group.color}18`, borderColor: group.color }]}
                  onPress={() => setGroupId(group.id)}
                >
                  <Text style={[styles.groupChipText, active && { color: group.color }]}>{group.title}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.label}>Icon</Text>
          <View style={styles.iconGrid}>
            {ICONS.map((item) => {
              const active = icon === item;
              return (
                <TouchableOpacity key={item} style={[styles.iconChoice, active && styles.iconChoiceActive]} onPress={() => setIcon(item)}>
                  <Ionicons name={item} size={22} color={active ? colors.primary : colors.textMuted} />
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Màu sắc</Text>
          <View style={styles.colorRow}>
            {COLORS.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.colorDot, { backgroundColor: item }, color === item && styles.colorSelected]}
                onPress={() => setColor(item)}
              />
            ))}
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveText}>Thêm danh mục</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Danh sách danh mục</Text>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.row}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("EditCategory", { categoryId: category.id })}
          >
            <View style={[styles.rowIcon, { backgroundColor: `${category.color}22` }]}>
              <CategoryIcon icon={category.icon} size={22} color={category.color || colors.primary} />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>{category.name}</Text>
              <Text style={styles.rowMeta}>{groupTitle(category.groupId)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.md },
  iconBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: colors.border, ...shadows.soft },
  headerTitle: { fontSize: typography.fontSize.lg, fontFamily: typography.family.bold, color: colors.textPrimary },
  content: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  formCard: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg, ...shadows.soft },
  formTitle: { fontSize: typography.fontSize.lg, color: colors.textPrimary, fontFamily: typography.family.bold, marginBottom: spacing.base },
  input: { backgroundColor: colors.surfaceAlt, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.base, fontSize: typography.fontSize.md, color: colors.textPrimary, fontFamily: typography.family.medium },
  label: { fontSize: typography.fontSize.sm, color: colors.textSecondary, fontFamily: typography.family.semiBold, marginTop: spacing.base, marginBottom: spacing.xs },
  segmentRow: { flexDirection: "row", gap: spacing.sm },
  segmentBtn: { flex: 1, borderRadius: borderRadius.full, paddingVertical: spacing.sm, alignItems: "center", borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceAlt },
  segmentActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  segmentText: { color: colors.textSecondary, fontFamily: typography.family.semiBold },
  segmentTextActive: { color: colors.textInverse },
  chipRow: { gap: spacing.sm },
  groupChip: { paddingHorizontal: spacing.base, paddingVertical: spacing.sm, borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceAlt },
  groupChipText: { color: colors.textSecondary, fontFamily: typography.family.semiBold },
  iconGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  iconChoice: { width: 44, height: 44, borderRadius: 16, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border, justifyContent: "center", alignItems: "center" },
  iconChoiceActive: { borderColor: colors.primary, backgroundColor: "#F0FAF3" },
  colorRow: { flexDirection: "row", gap: spacing.sm },
  colorDot: { width: 34, height: 34, borderRadius: 17 },
  colorSelected: { borderWidth: 3, borderColor: colors.surface, ...shadows.soft },
  saveBtn: { marginTop: spacing.lg, borderRadius: borderRadius.full, backgroundColor: colors.primary, paddingVertical: spacing.base, alignItems: "center" },
  saveText: { color: colors.textInverse, fontFamily: typography.family.bold, fontSize: typography.fontSize.base },
  sectionTitle: { fontSize: typography.fontSize.lg, color: colors.textPrimary, fontFamily: typography.family.bold, marginBottom: spacing.sm },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.base, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm, ...shadows.soft },
  rowIcon: { width: 46, height: 46, borderRadius: 18, justifyContent: "center", alignItems: "center", marginRight: spacing.base },
  rowInfo: { flex: 1 },
  rowTitle: { fontSize: typography.fontSize.md, color: colors.textPrimary, fontFamily: typography.family.semiBold },
  rowMeta: { fontSize: typography.fontSize.xs, color: colors.textSecondary, marginTop: 4 },
});

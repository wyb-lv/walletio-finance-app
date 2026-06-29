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
import { addSpendingGroup } from "../../store/slices/spendingGroupSlice";
import CategoryIcon from "../../components/common/CategoryIcon";
import { colors, shadows } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { borderRadius, spacing } from "../../theme/spacing";
import { safeIonicon } from "../../utils/icons";

const COLORS = [colors.primary, colors.info, colors.accent, colors.clay, colors.expense, colors.secondaryDark, colors.earth];
const ICONS = ["shield-checkmark-outline", "navigate-outline", "sparkles-outline", "school-outline", "trending-up-outline", "albums-outline"];

export default function SpendingGroupManagement({ navigation }) {
  const dispatch = useDispatch();
  const groups = useSelector((state) => state.spendingGroups.groups);
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState(ICONS[0]);
  const [color, setColor] = useState(COLORS[0]);

  const resetForm = () => {
    setTitle("");
    setIcon(ICONS[0]);
    setColor(COLORS[0]);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Thiếu tên nhóm", "Vui lòng nhập tên nhóm chi tiêu.");
      return;
    }
    try {
      await dispatch(addSpendingGroup({ title: title.trim(), icon, color })).unwrap();
      resetForm();
    } catch (error) {
      Alert.alert("Không lưu được nhóm", error || "Vui lòng thử lại.");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nhóm chi tiêu</Text>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.navigate("DeleteSpendingGroup")}
        >
          <Ionicons name="trash-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Thêm nhóm</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Tên nhóm"
            placeholderTextColor={colors.textMuted}
          />

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
            <Text style={styles.saveText}>Thêm nhóm</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Danh sách nhóm</Text>
        {groups.map((group) => (
          <TouchableOpacity
            key={group.id}
            style={styles.row}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("EditSpendingGroup", { groupId: group.id })}
          >
            <View style={[styles.rowIcon, { backgroundColor: `${group.color}22` }]}>
              <CategoryIcon icon={group.icon} size={22} color={group.color || colors.primary} fallback="albums-outline" />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>{group.title}</Text>
              <Text style={styles.rowMeta}>Nhấn để sửa</Text>
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

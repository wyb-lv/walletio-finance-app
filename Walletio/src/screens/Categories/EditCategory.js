import React, { useMemo, useState } from "react";
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
import { updateCategory } from "../../store/slices/categorySlice";
import { colors, shadows } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { borderRadius, spacing } from "../../theme/spacing";

const COLORS = [colors.primary, colors.info, colors.accent, colors.clay, colors.expense, colors.secondaryDark, colors.earth];
const ICONS = ["restaurant-outline", "car-outline", "bag-outline", "home-outline", "briefcase-outline", "gift-outline", "school-outline", "apps-outline"];

export default function EditCategory({ navigation, route }) {
  const dispatch = useDispatch();
  const categoryId = route.params?.categoryId;
  const category = useSelector((state) =>
    state.categories.categories.find((item) => item.id === categoryId),
  );
  const groups = useSelector((state) => state.spendingGroups.groups);

  const [name, setName] = useState(category?.name ?? "");
  const [color, setColor] = useState(category?.color ?? COLORS[0]);
  const [icon, setIcon] = useState(category?.icon ?? ICONS[0]);
  const [groupId, setGroupId] = useState(category?.groupId ?? groups[0]?.id ?? null);
  const [saving, setSaving] = useState(false);

  // The icon stored on the category may be an emoji or a name not in our preset
  // grid — surface it as an extra selectable choice so it isn't silently lost.
  const iconChoices = useMemo(
    () => (icon && !ICONS.includes(icon) ? [icon, ...ICONS] : ICONS),
    [icon],
  );

  if (!category) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sửa danh mục</Text>
          <View style={styles.iconBtn} />
        </View>
        <View style={styles.empty}>
          <Ionicons name="alert-circle-outline" size={42} color={colors.textMuted} />
          <Text style={styles.emptyText}>Không tìm thấy danh mục.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Thiếu tên", "Vui lòng nhập tên danh mục.");
      return;
    }
    setSaving(true);
    try {
      await dispatch(
        updateCategory({ id: category.id, name: name.trim(), color, icon, groupId }),
      ).unwrap();
      navigation.goBack();
    } catch (error) {
      Alert.alert("Không lưu được danh mục", error || "Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sửa danh mục</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.formCard}>
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
            {iconChoices.map((item) => {
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

          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveText}>{saving ? "Đang lưu..." : "Lưu danh mục"}</Text>
          </TouchableOpacity>
        </View>
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
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.sm },
  emptyText: { fontSize: typography.fontSize.md, color: colors.textMuted, fontFamily: typography.family.medium },
  formCard: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg, ...shadows.soft },
  input: { backgroundColor: colors.surfaceAlt, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.base, fontSize: typography.fontSize.md, color: colors.textPrimary, fontFamily: typography.family.medium },
  label: { fontSize: typography.fontSize.sm, color: colors.textSecondary, fontFamily: typography.family.semiBold, marginTop: spacing.base, marginBottom: spacing.xs },
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
  saveBtnDisabled: { opacity: 0.6 },
  saveText: { color: colors.textInverse, fontFamily: typography.family.bold, fontSize: typography.fontSize.base },
});

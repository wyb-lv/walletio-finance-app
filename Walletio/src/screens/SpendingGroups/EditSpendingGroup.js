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
import { updateSpendingGroup } from "../../store/slices/spendingGroupSlice";
import { colors, shadows } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { borderRadius, spacing } from "../../theme/spacing";

const COLORS = [colors.primary, colors.info, colors.accent, colors.clay, colors.expense, colors.secondaryDark, colors.earth];
const ICONS = ["shield-checkmark-outline", "navigate-outline", "sparkles-outline", "school-outline", "trending-up-outline", "albums-outline"];

export default function EditSpendingGroup({ navigation, route }) {
  const dispatch = useDispatch();
  const groupId = route.params?.groupId;
  const group = useSelector((state) =>
    state.spendingGroups.groups.find((item) => item.id === groupId),
  );

  const [title, setTitle] = useState(group?.title ?? "");
  const [icon, setIcon] = useState(group?.icon ?? ICONS[0]);
  const [color, setColor] = useState(group?.color ?? COLORS[0]);
  const [saving, setSaving] = useState(false);

  const iconChoices = useMemo(
    () => (icon && !ICONS.includes(icon) ? [icon, ...ICONS] : ICONS),
    [icon],
  );

  if (!group) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sửa nhóm</Text>
          <View style={styles.iconBtn} />
        </View>
        <View style={styles.empty}>
          <Ionicons name="alert-circle-outline" size={42} color={colors.textMuted} />
          <Text style={styles.emptyText}>Không tìm thấy nhóm chi tiêu.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Thiếu tên nhóm", "Vui lòng nhập tên nhóm chi tiêu.");
      return;
    }
    setSaving(true);
    try {
      await dispatch(
        updateSpendingGroup({ id: group.id, title: title.trim(), icon, color }),
      ).unwrap();
      navigation.goBack();
    } catch (error) {
      Alert.alert("Không lưu được nhóm", error || "Vui lòng thử lại.");
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
        <Text style={styles.headerTitle}>Sửa nhóm</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.formCard}>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Tên nhóm"
            placeholderTextColor={colors.textMuted}
          />

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
            <Text style={styles.saveText}>{saving ? "Đang lưu..." : "Lưu nhóm"}</Text>
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

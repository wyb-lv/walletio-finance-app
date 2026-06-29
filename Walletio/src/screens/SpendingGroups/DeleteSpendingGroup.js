import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { deleteSpendingGroup } from "../../store/slices/spendingGroupSlice";
import CategoryIcon from "../../components/common/CategoryIcon";
import Toast from "../../components/common/Toast";
import { colors, shadows } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { borderRadius, spacing } from "../../theme/spacing";

export default function DeleteSpendingGroup({ navigation }) {
  const dispatch = useDispatch();
  const groups = useSelector((state) => state.spendingGroups.groups);
  const categories = useSelector((state) => state.categories.categories);
  const [selected, setSelected] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  const showToast = (message, type = "success") => setToast({ visible: true, message, type });

  const categoryCount = (groupId) =>
    categories.filter((category) => category.groupId === groupId).length;

  const allSelected = groups.length > 0 && selected.length === groups.length;

  const toggle = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));

  const toggleAll = () => setSelected(allSelected ? [] : groups.map((group) => group.id));

  const runDelete = async () => {
    setDeleting(true);
    const ids = [...selected];
    const failed = [];
    for (const id of ids) {
      try {
        await dispatch(deleteSpendingGroup(id)).unwrap();
      } catch (error) {
        failed.push(id);
      }
    }
    setDeleting(false);
    setSelected(failed);
    if (failed.length === 0) {
      showToast(`Đã xoá ${ids.length} nhóm.`, "success");
    } else {
      showToast(`Không xoá được ${failed.length}/${ids.length} nhóm.`, "error");
    }
  };

  const confirmDelete = () => {
    if (selected.length === 0) return;
    const count = selected.length;
    const message = `Xoá ${count} nhóm đã chọn? Các danh mục thuộc nhóm có thể bị ảnh hưởng. Hành động này không thể hoàn tác.`;
    // On React Native Web, Alert.alert ignores button callbacks, so confirm via window.
    if (Platform.OS === "web") {
      if (typeof window === "undefined" || window.confirm(message)) runDelete();
      return;
    }
    Alert.alert("Xoá nhóm", message, [
      { text: "Huỷ", style: "cancel" },
      { text: "Xoá", style: "destructive", onPress: runDelete },
    ]);
  };

  const selectedNames = useMemo(
    () =>
      groups
        .filter((group) => selected.includes(group.id))
        .map((group) => group.title)
        .join(", "),
    [groups, selected],
  );

  return (
    <SafeAreaView style={styles.safe}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast((p) => ({ ...p, visible: false }))}
      />
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xoá nhóm</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={toggleAll} disabled={groups.length === 0}>
          <Ionicons
            name={allSelected ? "checkbox" : "checkbox-outline"}
            size={22}
            color={groups.length === 0 ? colors.textMuted : colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.hint}>
          Chọn nhóm chi tiêu bạn muốn xoá. Bạn có thể chọn nhiều nhóm cùng lúc.
        </Text>

        {groups.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="albums-outline" size={42} color={colors.textMuted} />
            <Text style={styles.emptyText}>Chưa có nhóm nào để xoá.</Text>
          </View>
        ) : (
          groups.map((group) => {
            const active = selected.includes(group.id);
            const count = categoryCount(group.id);
            return (
              <TouchableOpacity
                key={group.id}
                style={[styles.row, active && styles.rowActive]}
                activeOpacity={0.8}
                onPress={() => toggle(group.id)}
              >
                <View style={[styles.rowIcon, { backgroundColor: `${group.color}22` }]}>
                  <CategoryIcon icon={group.icon} size={22} color={group.color || colors.primary} fallback="albums-outline" />
                </View>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowTitle}>{group.title}</Text>
                  <Text style={styles.rowMeta}>{count} danh mục</Text>
                </View>
                <Ionicons
                  name={active ? "checkmark-circle" : "ellipse-outline"}
                  size={24}
                  color={active ? colors.error : colors.textMuted}
                />
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {selected.length > 0 && (
        <View style={styles.footer}>
          {selectedNames ? (
            <Text style={styles.footerHint} numberOfLines={1}>
              {selectedNames}
            </Text>
          ) : null}
          <TouchableOpacity
            style={[styles.deleteBtn, deleting && styles.deleteBtnDisabled]}
            onPress={confirmDelete}
            disabled={deleting}
            activeOpacity={0.85}
          >
            <Ionicons name="trash-outline" size={18} color={colors.textInverse} />
            <Text style={styles.deleteText}>
              {deleting ? "Đang xoá..." : `Xoá ${selected.length} nhóm`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.md },
  iconBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: colors.border, ...shadows.soft },
  headerTitle: { fontSize: typography.fontSize.lg, fontFamily: typography.family.bold, color: colors.textPrimary },
  content: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  hint: { fontSize: typography.fontSize.sm, color: colors.textSecondary, fontFamily: typography.family.medium, marginBottom: spacing.base },
  empty: { alignItems: "center", paddingVertical: spacing.xl, gap: spacing.sm },
  emptyText: { fontSize: typography.fontSize.md, color: colors.textMuted, fontFamily: typography.family.medium },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.base, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm, ...shadows.soft },
  rowActive: { borderColor: colors.error, backgroundColor: "#FBEDE8" },
  rowIcon: { width: 46, height: 46, borderRadius: 18, justifyContent: "center", alignItems: "center", marginRight: spacing.base },
  rowInfo: { flex: 1 },
  rowTitle: { fontSize: typography.fontSize.md, color: colors.textPrimary, fontFamily: typography.family.semiBold },
  rowMeta: { fontSize: typography.fontSize.xs, color: colors.textSecondary, marginTop: 4 },
  footer: { paddingHorizontal: spacing.md, paddingTop: spacing.base, paddingBottom: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface, gap: spacing.sm },
  footerHint: { fontSize: typography.fontSize.xs, color: colors.textSecondary, fontFamily: typography.family.medium },
  deleteBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.error, paddingVertical: spacing.base },
  deleteBtnDisabled: { opacity: 0.6 },
  deleteText: { color: colors.textInverse, fontFamily: typography.family.bold, fontSize: typography.fontSize.base },
});

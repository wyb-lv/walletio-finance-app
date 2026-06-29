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
import { deleteCategory } from "../../store/slices/categorySlice";
import CategoryIcon from "../../components/common/CategoryIcon";
import Toast from "../../components/common/Toast";
import { colors, shadows } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { borderRadius, spacing } from "../../theme/spacing";

export default function DeleteCategory({ navigation }) {
  const dispatch = useDispatch();
  const categories = useSelector((state) => state.categories.categories);
  const groups = useSelector((state) => state.spendingGroups.groups);
  const [selected, setSelected] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  const showToast = (message, type = "success") => setToast({ visible: true, message, type });

  const groupTitle = (id) => groups.find((group) => group.id === id)?.title || "Khác";

  const allSelected = categories.length > 0 && selected.length === categories.length;

  const toggle = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));

  const toggleAll = () =>
    setSelected(allSelected ? [] : categories.map((category) => category.id));

  const runDelete = async () => {
    setDeleting(true);
    const ids = [...selected];
    const failed = [];
    for (const id of ids) {
      try {
        await dispatch(deleteCategory(id)).unwrap();
      } catch (error) {
        failed.push(id);
      }
    }
    setDeleting(false);
    setSelected(failed);
    if (failed.length === 0) {
      showToast(`Đã xoá ${ids.length} danh mục.`, "success");
    } else {
      showToast(`Không xoá được ${failed.length}/${ids.length} danh mục.`, "error");
    }
  };

  const confirmDelete = () => {
    if (selected.length === 0) return;
    const count = selected.length;
    const message = `Xoá ${count} danh mục đã chọn? Hành động này không thể hoàn tác.`;
    // On React Native Web, Alert.alert ignores button callbacks, so confirm via window.
    if (Platform.OS === "web") {
      if (typeof window === "undefined" || window.confirm(message)) runDelete();
      return;
    }
    Alert.alert("Xoá danh mục", message, [
      { text: "Huỷ", style: "cancel" },
      { text: "Xoá", style: "destructive", onPress: runDelete },
    ]);
  };

  const selectedNames = useMemo(
    () =>
      categories
        .filter((category) => selected.includes(category.id))
        .map((category) => category.name)
        .join(", "),
    [categories, selected],
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
        <Text style={styles.headerTitle}>Xoá danh mục</Text>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={toggleAll}
          disabled={categories.length === 0}
        >
          <Ionicons
            name={allSelected ? "checkbox" : "checkbox-outline"}
            size={22}
            color={categories.length === 0 ? colors.textMuted : colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.hint}>
          Chọn danh mục bạn muốn xoá. Bạn có thể chọn nhiều danh mục cùng lúc.
        </Text>

        {categories.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="folder-open-outline" size={42} color={colors.textMuted} />
            <Text style={styles.emptyText}>Chưa có danh mục nào để xoá.</Text>
          </View>
        ) : (
          categories.map((category) => {
            const active = selected.includes(category.id);
            return (
              <TouchableOpacity
                key={category.id}
                style={[styles.row, active && styles.rowActive]}
                activeOpacity={0.8}
                onPress={() => toggle(category.id)}
              >
                <View style={[styles.rowIcon, { backgroundColor: `${category.color}22` }]}>
                  <CategoryIcon icon={category.icon} size={22} color={category.color || colors.primary} />
                </View>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowTitle}>{category.name}</Text>
                  <Text style={styles.rowMeta}>{groupTitle(category.groupId)}</Text>
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
              {deleting ? "Đang xoá..." : `Xoá ${selected.length} danh mục`}
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

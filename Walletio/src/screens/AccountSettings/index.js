import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser, updateProfile, changePassword, uploadAvatar } from "../../store/slices/authSlice";
import Toast from "../../components/common/Toast";
import { colors, gradients, shadows } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { borderRadius, spacing } from "../../theme/spacing";

// Only fields backed by the profile/auth data. `email` comes from the auth
// session and is read-only; `name` is the single editable profile field.
const FIELDS = [
  { key: "name",  icon: "person-outline", label: "Họ và tên", placeholder: "Nhập họ và tên", editable: true },
  { key: "email", icon: "mail-outline",   label: "Email",      placeholder: "Email", keyboardType: "email-address", editable: false },
];

/* ─── Main Screen ───────────────────────────────────────────── */
export default function AccountSettings({ navigation }) {
  const dispatch = useDispatch();
  const { user, status } = useSelector((s) => s.auth);
  const wallets      = useSelector((s) => s.wallets?.wallets ?? []);
  const transactions = useSelector((s) => s.transactions?.transactions ?? []);

  const [editing, setEditing]   = useState(false);
  const [avatarUri, setAvatarUri] = useState(user?.avatar || null);
  const [form, setForm] = useState({
    name:  user?.name  || "",
    email: user?.email || "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [pwd, setPwd] = useState({ old: "", new: "", confirm: "" });
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });
  const showToast = (message, type = "success") => setToast({ visible: true, message, type });

  useEffect(() => {
    setAvatarUri(user?.avatar || null);
    setForm({
      name:  user?.name  || "",
      email: user?.email || "",
    });
  }, [user]);

  /* ── Handlers ── */
  const handlePickAvatar = async () => {
    const { status: perm } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm !== "granted") {
      Alert.alert("Quyền bị từ chối", "Cần quyền truy cập thư viện ảnh để thay đổi ảnh đại diện.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });
    if (result.canceled || !result.assets?.[0]?.base64) return;

    // Optimistic preview, then upload to the bucket (replaces the existing avatar).
    setAvatarUri(result.assets[0].uri);
    try {
      await dispatch(uploadAvatar(result.assets[0].base64)).unwrap();
      showToast("Đã cập nhật ảnh đại diện.", "success");
    } catch (error) {
      setAvatarUri(user?.avatar || null);
      showToast(error || "Không tải được ảnh đại diện.", "error");
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      showToast("Họ và tên không được để trống.", "error");
      return;
    }
    try {
      // Avatar is uploaded separately on pick; here we only persist the name.
      await dispatch(updateProfile({ name: form.name.trim() })).unwrap();
      setEditing(false);
      showToast("Thông tin tài khoản đã được cập nhật.", "success");
    } catch (error) {
      showToast(error || "Không lưu được hồ sơ.", "error");
    }
  };

  const handleCancel = () => {
    setForm({
      name:  user?.name  || "",
      email: user?.email || "",
    });
    setAvatarUri(user?.avatar || null);
    setEditing(false);
  };

  const handleChangePassword = async () => {
    if (!pwd.old || !pwd.new) {
      showToast("Vui lòng nhập mật khẩu cũ và mới.", "error");
      return;
    }
    if (pwd.new.length < 6) {
      showToast("Mật khẩu mới cần ít nhất 6 ký tự.", "error");
      return;
    }
    if (pwd.new !== pwd.confirm) {
      showToast("Xác nhận mật khẩu không khớp.", "error");
      return;
    }
    try {
      await dispatch(
        changePassword({ oldPassword: pwd.old, newPassword: pwd.new }),
      ).unwrap();
      setPwd({ old: "", new: "", confirm: "" });
      setShowPassword(false);
      showToast("Đổi mật khẩu thành công.", "success");
    } catch (error) {
      showToast(error || "Đổi mật khẩu thất bại.", "error");
    }
  };

  const handleLogout = () => {
    const doLogout = () => dispatch(logoutUser());
    // On React Native Web, Alert.alert ignores button callbacks, so confirm via window.
    if (Platform.OS === "web") {
      if (typeof window === "undefined" || window.confirm("Bạn có chắc muốn đăng xuất?")) {
        doLogout();
      }
      return;
    }
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
      { text: "Huỷ", style: "cancel" },
      { text: "Đăng xuất", style: "destructive", onPress: doLogout },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast((p) => ({ ...p, visible: false }))}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* ── Header ── */}
          <Animated.View entering={FadeInDown.duration(420)} style={styles.header}>
            <Text style={styles.title}>Cá nhân</Text>
          </Animated.View>

          {/* ── Profile card with avatar ── */}
          <Animated.View entering={FadeInUp.duration(520).springify()} style={styles.profileCard}>
            <LinearGradient colors={gradients.sky} style={styles.profileGradient}>

              {/* Avatar */}
              <TouchableOpacity
                style={styles.avatarWrap}
                onPress={handlePickAvatar}
                activeOpacity={0.8}
              >
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
                ) : (
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>👤</Text>
                  </View>
                )}
                <View style={styles.cameraBadge}>
                  <Ionicons name="camera" size={13} color="#fff" />
                </View>
              </TouchableOpacity>

              <Text style={styles.profileName}>{form.name || "Người dùng"}</Text>
              <Text style={styles.profileEmail}>{form.email || "nguyidung@thinhvuong.com"}</Text>

              {/* Change photo shortcut (edit mode only) */}
              {editing && (
                <TouchableOpacity style={styles.changePhotoBtn} onPress={handlePickAvatar}>
                  <Ionicons name="image-outline" size={14} color={colors.primary} />
                  <Text style={styles.changePhotoText}>Thay đổi ảnh đại diện</Text>
                </TouchableOpacity>
              )}

              {/* Stats */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{transactions.length}</Text>
                  <Text style={styles.statLabel}>Giao dịch</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{wallets.length}</Text>
                  <Text style={styles.statLabel}>Tài ví</Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* ── Account Info Section header ── */}
          <Animated.View entering={FadeInUp.delay(60).duration(480)} style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Thông tin tài khoản</Text>
            {editing ? (
              <TouchableOpacity style={styles.editBtn} onPress={handleSave}>
                <Text style={styles.editBtnText}>Lưu</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
                <Ionicons name="create-outline" size={16} color={colors.primary} />
                <Text style={styles.editBtnText}>Sửa</Text>
              </TouchableOpacity>
            )}
          </Animated.View>

          {/* ── Info fields ── */}
          <Animated.View entering={FadeInUp.delay(120).duration(480)} style={styles.infoCard}>
            {FIELDS.map((field, i) => (
              <View key={field.key}>
                <View style={styles.fieldRow}>
                  <View style={styles.fieldIcon}>
                    <Ionicons name={field.icon} size={18} color={colors.primary} />
                  </View>
                  <View style={styles.fieldContent}>
                    <Text style={styles.fieldLabel}>{field.label}</Text>
                    {editing && field.editable ? (
                      <TextInput
                        style={styles.fieldInput}
                        value={form[field.key]}
                        onChangeText={(v) => setForm((prev) => ({ ...prev, [field.key]: v }))}
                        placeholder={field.placeholder}
                        placeholderTextColor={colors.textMuted}
                        keyboardType={field.keyboardType || "default"}
                        autoCapitalize="none"
                      />
                    ) : (
                      <Text style={[styles.fieldValue, !form[field.key] && styles.fieldEmpty]}>
                        {form[field.key] || "Chưa cập nhật"}
                      </Text>
                    )}
                  </View>
                  {editing && field.editable && (
                    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                  )}
                </View>
                {i < FIELDS.length - 1 && (
                  <View style={[styles.divider, { marginLeft: 34 + spacing.sm }]} />
                )}
              </View>
            ))}
          </Animated.View>

          {/* ── Security: change password ── */}
          <Animated.View entering={FadeInUp.delay(150).duration(480)} style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bảo mật</Text>
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(180).duration(480)} style={styles.infoCard}>
            <TouchableOpacity
              style={styles.fieldRow}
              onPress={() => setShowPassword((prev) => !prev)}
              activeOpacity={0.8}
            >
              <View style={styles.fieldIcon}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.primary} />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldValue}>Đổi mật khẩu</Text>
              </View>
              <Ionicons
                name={showPassword ? "chevron-up" : "chevron-forward"}
                size={16}
                color={colors.textMuted}
              />
            </TouchableOpacity>

            {showPassword && (
              <View style={styles.passwordForm}>
                <TextInput
                  style={styles.passwordInput}
                  value={pwd.old}
                  onChangeText={(v) => setPwd((p) => ({ ...p, old: v }))}
                  placeholder="Mật khẩu hiện tại"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                  autoCapitalize="none"
                />
                <TextInput
                  style={styles.passwordInput}
                  value={pwd.new}
                  onChangeText={(v) => setPwd((p) => ({ ...p, new: v }))}
                  placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                  autoCapitalize="none"
                />
                <TextInput
                  style={styles.passwordInput}
                  value={pwd.confirm}
                  onChangeText={(v) => setPwd((p) => ({ ...p, confirm: v }))}
                  placeholder="Xác nhận mật khẩu mới"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={[styles.savePasswordBtn, status === "pending" && { opacity: 0.6 }]}
                  onPress={handleChangePassword}
                  disabled={status === "pending"}
                >
                  <Text style={styles.savePasswordText}>
                    {status === "pending" ? "Đang lưu..." : "Cập nhật mật khẩu"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>

          {/* ── Quản lý danh mục & nhóm chi tiêu ── */}
          <Animated.View entering={FadeInUp.delay(210).duration(480)} style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quản lý</Text>
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(240).duration(480)} style={styles.infoCard}>
            <TouchableOpacity
              style={styles.fieldRow}
              onPress={() => navigation.navigate("CategoryManagement")}
              activeOpacity={0.8}
            >
              <View style={styles.fieldIcon}>
                <Ionicons name="pricetags-outline" size={18} color={colors.primary} />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldValue}>Quản lý danh mục</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={[styles.divider, { marginLeft: 34 + spacing.sm }]} />

            <TouchableOpacity
              style={styles.fieldRow}
              onPress={() => navigation.navigate("SpendingGroupManagement")}
              activeOpacity={0.8}
            >
              <View style={styles.fieldIcon}>
                <Ionicons name="albums-outline" size={18} color={colors.primary} />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldValue}>Nhóm chi tiêu</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </Animated.View>

          {/* ── Cancel button (only in edit mode) ── */}
          {editing && (
            <Animated.View entering={FadeInUp.duration(300)} style={{ marginHorizontal: spacing.md, marginBottom: spacing.base }}>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                <Text style={styles.cancelText}>Huỷ thay đổi</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* ── Đăng xuất ── */}
          <TouchableOpacity
            style={[styles.logoutBtn, status === "pending" && { opacity: 0.6 }]}
            onPress={handleLogout}
            disabled={status === "pending"}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={18} color={colors.error} style={{ marginRight: 6 }} />
            <Text style={styles.logoutText}>
              {status === "pending" ? "Đang xử lý..." : "Đăng xuất"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.version}>Phiên bản 1.0.0</Text>
          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ─── Styles ────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  // Header
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.family.bold,
    color: colors.textPrimary,
  },

  // Profile card
  profileCard: {
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.xxl,
    overflow: "hidden",
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  profileGradient: { padding: spacing.lg, alignItems: "center" },

  // Avatar
  avatarWrap: {
    position: "relative",
    marginBottom: spacing.base,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.primaryLight,
    ...shadows.soft,
  },
  avatarImg: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: colors.primaryLight,
  },
  avatarText: { fontSize: 36 },
  cameraBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.surface,
  },
  changePhotoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  changePhotoText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.family.medium,
    color: colors.primary,
  },

  profileName: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.family.bold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontFamily: typography.family.medium,
    marginBottom: spacing.base,
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  statItem: { alignItems: "center", paddingHorizontal: spacing.xl },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.family.bold,
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontFamily: typography.family.medium,
    marginTop: 2,
  },
  statDivider: { width: 1, backgroundColor: colors.border },

  // Section header
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.family.bold,
    color: colors.textPrimary,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  editBtnText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.family.semiBold,
    color: colors.primary,
  },

  // Info card
  infoCard: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.base,
    ...shadows.soft,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.base,
    gap: spacing.sm,
  },
  fieldIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  fieldContent: { flex: 1 },
  fieldLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    fontFamily: typography.family.medium,
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
    fontFamily: typography.family.semiBold,
  },
  fieldEmpty: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontStyle: "italic",
  },
  fieldInput: {
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
    fontFamily: typography.family.semiBold,
    paddingVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
  },

  // Password form
  passwordForm: {
    paddingBottom: spacing.base,
    gap: spacing.sm,
  },
  passwordInput: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.base,
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
    fontFamily: typography.family.medium,
  },
  savePasswordBtn: {
    marginTop: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    paddingVertical: spacing.base,
    alignItems: "center",
  },
  savePasswordText: {
    color: colors.textInverse,
    fontSize: typography.fontSize.base,
    fontFamily: typography.family.bold,
  },

  // Cancel
  cancelBtn: {
    paddingVertical: spacing.base,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.family.medium,
    color: colors.textSecondary,
  },

  // Logout
  logoutBtn: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.base,
    backgroundColor: "#FBEDE8",
    borderRadius: borderRadius.full,
    paddingVertical: spacing.base,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(216,92,74,0.18)",
  },
  logoutText: {
    color: colors.error,
    fontSize: typography.fontSize.base,
    fontFamily: typography.family.semiBold,
  },

  version: {
    textAlign: "center",
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.family.regular,
  },
});

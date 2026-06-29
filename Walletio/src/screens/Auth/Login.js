import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../store/slices/authSlice";
import Toast from "../../components/common/Toast";
import { colors, gradients, shadows } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { borderRadius, spacing } from "../../theme/spacing";

export default function Login({ navigation }) {
  const dispatch = useDispatch();
  const { status } = useSelector((state) => state.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  const showToast = (message, type = "error") => setToast({ visible: true, message, type });

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showToast("Vui lòng nhập email và mật khẩu.");
      return;
    }
    if (password.length < 6) {
      showToast("Mật khẩu cần ít nhất 6 ký tự.");
      return;
    }
    try {
      await dispatch(loginUser({ email: email.trim(), password })).unwrap();
      // Success notification is shown by AppNavigator once the session is set.
    } catch (error) {
      showToast(error || "Đăng nhập thất bại. Vui lòng thử lại.");
    }
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
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <View style={styles.brandBlock}>
          <View style={styles.logo}>
            <Ionicons name="wallet-outline" size={34} color={colors.primary} />
          </View>
          <Text style={styles.title}>Walletio</Text>
          <Text style={styles.subtitle}>Quản lý ví, giao dịch và ngân sách cá nhân</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={20} color={colors.textMuted} />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="email@example.com"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <Text style={styles.label}>Mật khẩu</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Tối thiểu 6 ký tự"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, status === "pending" && { opacity: 0.65 }]}
            onPress={handleLogin}
            disabled={status === "pending"}
          >
            <LinearGradient colors={gradients.forest} style={styles.primaryGradient}>
              <Text style={styles.primaryText}>
                {status === "pending" ? "Đang đăng nhập..." : "Đăng nhập"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Chưa có tài khoản?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.footerLink}>Tạo tài khoản</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: spacing.md, justifyContent: "center" },
  brandBlock: { alignItems: "center", marginBottom: spacing.xl },
  logo: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  title: { fontSize: typography.fontSize.huge, fontFamily: typography.family.bold, color: colors.textPrimary },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xs,
    lineHeight: 21,
    fontFamily: typography.family.medium,
  },
  form: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.family.semiBold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.base,
    paddingLeft: spacing.sm,
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontFamily: typography.family.medium,
  },
  primaryBtn: { borderRadius: borderRadius.full, overflow: "hidden", marginTop: spacing.lg },
  primaryGradient: { paddingVertical: spacing.base, alignItems: "center" },
  primaryText: { color: colors.textInverse, fontSize: typography.fontSize.base, fontFamily: typography.family.bold },
  footer: { flexDirection: "row", justifyContent: "center", gap: spacing.xs, marginTop: spacing.lg },
  footerText: { color: colors.textSecondary, fontFamily: typography.family.medium },
  footerLink: { color: colors.primary, fontFamily: typography.family.bold },
});

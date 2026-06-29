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
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch, useSelector } from "react-redux";
import { fetchWalletSummary, updateWallet } from "../../store/slices/walletSlice";
import { colors, gradients, shadows } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { borderRadius, spacing } from "../../theme/spacing";

const WALLET_TYPES = [
  { key: "payment", label: "Ví thanh toán", icon: "cash-outline", color: colors.primary },
  { key: "tracking", label: "Ví theo dõi", icon: "analytics-outline", color: colors.info },
];

const COLORS = [colors.primary, colors.info, colors.accent, colors.clay, colors.expense, colors.secondaryDark, colors.earth];

export default function EditWalletModal({ navigation, route }) {
  const dispatch = useDispatch();
  const walletId = route?.params?.walletId;
  const wallet = useSelector((state) => state.wallets.wallets.find((item) => item.id === walletId));
  const [name, setName] = useState(wallet?.name || "");
  // Load the wallet's current balance (số tiền hiện tại), not the opening balance.
  const [balance, setBalance] = useState(
    String(wallet?.balance ?? wallet?.openingBalance ?? 0),
  );
  const [type, setType] = useState(wallet?.type || "payment");
  const [color, setColor] = useState(wallet?.color || COLORS[0]);
  const [isDefault, setIsDefault] = useState(Boolean(wallet?.isDefault));

  const selectedType = WALLET_TYPES.find((item) => item.key === type) || WALLET_TYPES[0];

  const handleSave = async () => {
    if (!wallet) return;
    if (!name.trim()) {
      Alert.alert("Thiếu tên ví", "Vui lòng nhập tên ví.");
      return;
    }
    if (Number(balance) < 0 || Number.isNaN(Number(balance))) {
      Alert.alert("Số dư không hợp lệ", "Vui lòng nhập số dư hợp lệ.");
      return;
    }
    try {
      await dispatch(updateWallet({
        id: wallet.id,
        name: name.trim(),
        openingBalance: Number(balance),
        type,
        color,
        icon: selectedType.icon,
        isDefault,
      })).unwrap();
      dispatch(fetchWalletSummary());
      navigation.goBack();
    } catch (error) {
      Alert.alert("Không lưu được ví", error || "Vui lòng thử lại.");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Sửa ví</Text>
        <TouchableOpacity style={styles.saveMiniBtn} onPress={handleSave}>
          <Ionicons name="checkmark" size={22} color={colors.textInverse} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.preview}>
          <View style={[styles.previewIcon, { backgroundColor: `${color}22` }]}>
            <Ionicons name={selectedType.icon} size={30} color={color} />
          </View>
          <Text style={styles.previewName}>{name || "Tên ví"}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Tên ví</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Tên ví" placeholderTextColor={colors.textMuted} />

          <Text style={styles.label}>Số dư trong ví</Text>
          <TextInput
            style={styles.input}
            value={balance}
            onChangeText={setBalance}
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Loại ví</Text>
          <View style={styles.typeGrid}>
            {WALLET_TYPES.map((item) => {
              const active = type === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.typeBtn, active && { borderColor: item.color, backgroundColor: `${item.color}14` }]}
                  onPress={() => {
                    setType(item.key);
                    setColor(item.color);
                  }}
                >
                  <Ionicons name={item.icon} size={22} color={active ? item.color : colors.textMuted} />
                  <Text style={[styles.typeText, active && { color: item.color }]}>{item.label}</Text>
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

          <TouchableOpacity style={styles.toggleRow} onPress={() => setIsDefault((value) => !value)}>
            <View>
              <Text style={styles.toggleTitle}>Đặt làm ví mặc định</Text>
              <Text style={styles.toggleHint}>Ví này sẽ được chọn trước khi tạo giao dịch.</Text>
            </View>
            <View style={[styles.switchTrack, isDefault && styles.switchActive]}>
              <View style={[styles.switchThumb, isDefault && styles.switchThumbActive]} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <LinearGradient colors={gradients.forest} style={styles.saveGradient}>
          <Text style={styles.saveText}>Lưu thay đổi</Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.md },
  iconBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: colors.border, ...shadows.soft },
  saveMiniBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primary, justifyContent: "center", alignItems: "center", ...shadows.soft },
  title: { fontSize: typography.fontSize.lg, fontFamily: typography.family.bold, color: colors.textPrimary },
  content: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  preview: { alignItems: "center", marginBottom: spacing.lg },
  previewIcon: { width: 78, height: 78, borderRadius: 26, justifyContent: "center", alignItems: "center", marginBottom: spacing.sm },
  previewName: { fontSize: typography.fontSize.xl, color: colors.textPrimary, fontFamily: typography.family.bold },
  card: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.md, borderWidth: 1, borderColor: colors.border, ...shadows.soft },
  label: { fontSize: typography.fontSize.sm, color: colors.textSecondary, fontFamily: typography.family.semiBold, marginTop: spacing.base, marginBottom: spacing.xs },
  input: { backgroundColor: colors.surfaceAlt, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.base, fontSize: typography.fontSize.md, color: colors.textPrimary, fontFamily: typography.family.medium },
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  typeBtn: { width: "48%", borderRadius: borderRadius.lg, padding: spacing.base, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border, gap: spacing.xs },
  typeText: { fontSize: typography.fontSize.sm, color: colors.textSecondary, fontFamily: typography.family.semiBold },
  colorRow: { flexDirection: "row", gap: spacing.sm },
  colorDot: { width: 36, height: 36, borderRadius: 18 },
  colorSelected: { borderWidth: 3, borderColor: colors.surface, ...shadows.soft },
  toggleRow: { marginTop: spacing.lg, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md, backgroundColor: colors.surfaceAlt, borderRadius: borderRadius.lg, padding: spacing.base },
  toggleTitle: { fontSize: typography.fontSize.md, color: colors.textPrimary, fontFamily: typography.family.semiBold },
  toggleHint: { fontSize: typography.fontSize.xs, color: colors.textSecondary, marginTop: 3 },
  switchTrack: { width: 52, height: 30, borderRadius: 15, backgroundColor: colors.border, padding: 3 },
  switchActive: { backgroundColor: colors.primary },
  switchThumb: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.surface },
  switchThumbActive: { transform: [{ translateX: 22 }] },
  saveBtn: { marginHorizontal: spacing.md, marginBottom: spacing.lg, borderRadius: borderRadius.full, overflow: "hidden", ...shadows.lifted },
  saveGradient: { paddingVertical: spacing.base, alignItems: "center" },
  saveText: { color: colors.textInverse, fontSize: typography.fontSize.base, fontFamily: typography.family.bold },
});

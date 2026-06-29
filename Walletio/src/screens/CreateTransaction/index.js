import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector, useStore } from "react-redux";
import { createTransaction, updateTransaction } from "../../store/slices/transactionSlice";
import { selectBudgetSummary } from "../../store/slices/budgetSlice";
import { fetchWallets, fetchWalletSummary } from "../../store/slices/walletSlice";
import BottomSheet from "../../components/common/BottomSheet";
import CategoryPicker from "../../components/common/CategoryPicker";
import WalletCard from "../../components/common/WalletCard";
import Toast from "../../components/common/Toast";
import { colors, shadows } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { borderRadius, spacing } from "../../theme/spacing";

const fmtDate = (d) => {
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  return `${day}/${month}`;
};

const fmtDateFull = (d) => {
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// Parse "dd/mm/yyyy" -> Date
const parseDateStr = (str) => {
  if (!str) return new Date();
  const [d, m, y] = str.split("/").map(Number);
  return new Date(y, m - 1, d);
};

const VI_WEEKDAYS = ["TH 2", "TH 3", "TH 4", "TH 5", "TH 6", "TH 7", "CN"];

/** Lịch chọn ngày inline */
function CalendarPicker({ selected, calendarDate, onChangeMonth, onSelect }) {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth(); // 0-indexed

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Ngày 1 của tháng là thứ mấy (Monday-based)
  const firstDay = new Date(year, month, 1);
  const startDow = (firstDay.getDay() + 6) % 7; // 0=Mon
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isSelected = (d) =>
    d &&
    selected.getDate() === d &&
    selected.getMonth() === month &&
    selected.getFullYear() === year;

  const isToday = (d) =>
    d &&
    today.getDate() === d &&
    today.getMonth() === month &&
    today.getFullYear() === year;

  const prevMonth = () => {
    const d = new Date(year, month - 1, 1);
    onChangeMonth(d);
  };
  const nextMonth = () => {
    const d = new Date(year, month + 1, 1);
    onChangeMonth(d);
  };

  return (
    <View style={cal.wrap}>
      {/* Month header */}
      <View style={cal.header}>
        <TouchableOpacity onPress={prevMonth} style={cal.navBtn}>
          <Text style={cal.navIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={cal.monthTitle}>
          tháng {month + 1} năm {year}
        </Text>
        <TouchableOpacity onPress={nextMonth} style={cal.navBtn}>
          <Text style={cal.navIcon}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Weekday headers */}
      <View style={cal.weekRow}>
        {VI_WEEKDAYS.map((wd) => (
          <Text key={wd} style={cal.weekDay}>{wd}</Text>
        ))}
      </View>

      {/* Days grid */}
      <View style={cal.grid}>
        {cells.map((d, i) => {
          const sel = isSelected(d);
          const tod = isToday(d);
          return (
            <TouchableOpacity
              key={i}
              style={cal.cell}
              onPress={() => d && onSelect(new Date(year, month, d))}
              activeOpacity={d ? 0.7 : 1}
            >
              {d ? (
                <View style={[cal.dayCircle, sel && cal.daySelected, tod && !sel && cal.dayToday]}>
                  <Text style={[cal.dayText, sel && cal.dayTextSelected, tod && !sel && cal.dayTextToday]}>
                    {d}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const cal = StyleSheet.create({
  wrap: { paddingTop: spacing.xs, paddingBottom: spacing.base },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.sm },
  monthTitle: { fontSize: typography.fontSize.base, fontFamily: typography.family.semiBold, color: colors.textPrimary },
  navBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceAlt, justifyContent: "center", alignItems: "center" },
  navIcon: { fontSize: 20, color: colors.accent, fontFamily: typography.family.medium, lineHeight: 24 },
  weekRow: { flexDirection: "row", marginBottom: spacing.xs },
  weekDay: { flex: 1, textAlign: "center", fontSize: typography.fontSize.xs, fontFamily: typography.family.medium, color: colors.textMuted },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: "14.28%", aspectRatio: 1, justifyContent: "center", alignItems: "center" },
  dayCircle: { width: 34, height: 34, borderRadius: 17, justifyContent: "center", alignItems: "center" },
  daySelected: { backgroundColor: colors.accent },
  dayToday: { borderWidth: 2, borderColor: colors.accent },
  dayText: { fontSize: typography.fontSize.md, fontFamily: typography.family.medium, color: colors.textPrimary },
  dayTextSelected: { color: colors.primaryDark, fontFamily: typography.family.bold },
  dayTextToday: { color: colors.accent, fontFamily: typography.family.bold },
});

const fmtMoney = (value = 0) => `${Math.round(value).toLocaleString("vi-VN")}đ`;

export default function CreateTransaction({ navigation, route }) {
  const dispatch = useDispatch();
  const store = useStore();
  const { status } = useSelector((s) => s.transactions);
  const wallets = useSelector((s) => s.wallets.wallets);
  const categories = useSelector((s) => s.categories.categories);
  const emotions = useSelector((s) => s.emotions.emotions);

  const editData = route?.params?.editData;
  const initialType = route?.params?.initialType ?? "expense";

  const [type, setType] = useState(editData?.type ?? initialType);
  const [amount, setAmount] = useState(String(Math.abs(editData?.amount ?? 0)));
  const [note, setNote] = useState(editData?.note ?? "");
  const [category, setCategory] = useState(editData?.category ?? null);
  const [categoryId, setCategoryId] = useState(editData?.categoryId ?? "");
  const [emotionId, setEmotionId] = useState(editData?.emotionId ?? null);
  const [walletId, setWalletId] = useState(
    route?.params?.walletId ?? editData?.walletId ?? wallets[0]?.id ?? ""
  );
  const [date, setDate] = useState(
    editData?.date ? parseDateStr(editData.date) : new Date()
  );
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [showCatPicker, setShowCatPicker] = useState(false);
  const [showEmotionPicker, setShowEmotionPicker] = useState(false);
  const [showWalletPick, setShowWalletPick] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  useEffect(() => {
    const incoming = route?.params?.initialType ?? "expense";
    setType(editData?.type ?? incoming);
    if (editData) {
      setAmount(String(Math.abs(editData.amount ?? 0)));
      setNote(editData.note ?? "");
      setCategory(editData.category ?? null);
      setCategoryId(editData.categoryId ?? "");
      setEmotionId(editData.emotionId ?? null);
      setWalletId(editData.walletId ?? wallets[0]?.id ?? "");
    } else if (route?.params?.walletId) {
      setWalletId(route.params.walletId);
    }
  }, [route?.params?.initialType, route?.params?.walletId, editData?.id]);

  const selectedWallet = wallets.find((w) => w.id === walletId) ?? wallets[0];
  const selectedCategory = categories.find((c) => c.id === categoryId || c.name === category);
  const selectedEmotion = emotions.find((e) => e.id === emotionId);
  const dateLabel = fmtDate(date);
  const dateLabelFull = fmtDateFull(date);

  const isSaving = status === "pending";
  const isExpense = type === "expense";
  const amountColor = isExpense ? colors.expense : colors.income;
  const amountPrefix = isExpense ? "−đ" : "+đ";

  const showToast = (message, toastType = "success") =>
    setToast({ visible: true, message, type: toastType });

  const handlePad = (key) => {
    if (key === "⌫") {
      setAmount((p) => (p.length <= 1 ? "0" : p.slice(0, -1)));
      return;
    }
    setAmount((p) => (p === "0" ? key : (p + key).length > 12 ? p : p + key));
  };

  // After saving an expense, inspect the category's budget for the transaction's
  // month. Reads fresh state so the just-saved row is counted. Matching is lenient
  // (id OR normalized name) because a transaction may carry the local category id
  // while the budget carries the backend uuid.
  const getBudgetStatus = () => {
    if (type !== "expense") return null;
    const norm = (s) => (s ?? "").trim().toLowerCase();
    const catId = selectedCategory?.id ?? categoryId ?? null;
    const catName = norm(category ?? selectedCategory?.name);
    if (!catId && !catName) return { kind: "no-category" };

    const summary = selectBudgetSummary(
      store.getState(),
      date.getMonth() + 1,
      date.getFullYear(),
    );
    const row = summary.find(
      (b) =>
        (catId && b.categoryId === catId) ||
        (catName && norm(b.category) === catName),
    );
    if (!row || !(row.limit > 0)) return { kind: "no-budget" };
    return {
      kind: row.spent > row.limit ? "over" : "under",
      name: row.category ?? category,
      spent: row.spent,
      limit: row.limit,
    };
  };

  const doSave = async (andContinue = false) => {
    if (isSaving) return;

    if (Number(amount) === 0) {
      Alert.alert("Lỗi", "Vui lòng nhập số tiền.");
      return;
    }
    const payload = {
      type,
      amount: Number(amount),
      direction: type === "income" ? "in" : "out",
      note,
      categoryId: selectedCategory?.id ?? categoryId,
      category: category ?? "",
      emotionId: selectedEmotion?.id ?? emotionId,
      walletId: selectedWallet?.id,
      date: dateLabelFull,
      expense_date: dateLabelFull,
      description: note || category || "Giao dịch",
    };

    try {
      if (editData) {
        await dispatch(updateTransaction({ id: editData.id, ...payload })).unwrap();
      } else {
        await dispatch(createTransaction(payload)).unwrap();
      }
      dispatch(fetchWallets());
      dispatch(fetchWalletSummary());

      // Build the toast. "over" is the real feature; the other branches are a
      // temporary diagnostic so we can see why a warning may not appear.
      const st = getBudgetStatus();
      let msg = editData ? "Đã cập nhật!" : "Đã lưu giao dịch!";
      let msgType = "success";
      let holdLonger = false;
      if (st?.kind === "over") {
        msg = `⚠️ Vượt ngân sách "${st.name}"! Đã chi ${fmtMoney(st.spent)} / ${fmtMoney(st.limit)}.`;
        msgType = "error";
        holdLonger = true;
      } else if (st?.kind === "under") {
        msg = `Đã lưu. "${st.name}": ${fmtMoney(st.spent)}/${fmtMoney(st.limit)} (chưa vượt).`;
        msgType = "info";
      } else if (st?.kind === "no-budget") {
        msg = "Đã lưu. Danh mục này chưa có ngân sách tháng này.";
        msgType = "info";
      }

      if (andContinue) {
        setAmount("0");
        setNote("");
        setCategory(null);
        setCategoryId("");
        setEmotionId(null);
        showToast(msg, msgType);
      } else {
        showToast(msg, msgType);
        setTimeout(() => navigation.goBack(), holdLonger ? 2200 : 1200);
      }
    } catch (error) {
      Alert.alert("Không lưu được giao dịch", error || "Vui lòng thử lại.");
    }
  };

  const getEmotionEmoji = () => selectedEmotion?.emoji ?? "🙂";

  return (
    <SafeAreaView style={styles.safe}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast((p) => ({ ...p, visible: false }))}
      />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={18} color={colors.textPrimary} />
        </TouchableOpacity>

        {/* Toggle pill */}
        <View style={styles.togglePill}>
          <TouchableOpacity
            style={[styles.toggleOption, type === "expense" && styles.toggleActive]}
            onPress={() => {
              setType("expense");
              setCategory(null);
              setCategoryId("");
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.toggleArrow}>↗</Text>
            <Text style={[styles.toggleText, type === "expense" && styles.toggleTextActive]}>
              Tiền ra
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleOption, type === "income" && styles.toggleActive]}
            onPress={() => {
              setType("income");
              setCategory(null);
              setCategoryId("");
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.toggleArrow}>↙</Text>
            <Text style={[styles.toggleText, type === "income" && styles.toggleTextActive]}>
              Tiền vào
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* ── Center area ── */}
      <View style={styles.centerArea}>
        {/* Emotion icon */}
        <TouchableOpacity
          style={styles.catIconWrap}
          onPress={() => setShowEmotionPicker(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.catEmoji}>{getEmotionEmoji()}</Text>
        </TouchableOpacity>
        <Text style={styles.emotionHint}>
          {selectedEmotion?.label ?? "Cảm xúc?"}
        </Text>

        {/* Amount */}
        <Text style={[styles.amountDisplay, { color: amountColor }]}>
          {amountPrefix}
          {Number(amount).toLocaleString("vi-VN")}
        </Text>

        {/* Note input */}
        <TextInput
          style={styles.noteInput}
          placeholder="Thêm mô tả..."
          placeholderTextColor={colors.textMuted}
          value={note}
          onChangeText={setNote}
          textAlign="center"
        />
      </View>

      {/* ── Chips bar (wallet / category / date) ── */}
      <View style={styles.chipsBar}>
        <TouchableOpacity style={styles.chip} onPress={() => setShowWalletPick(true)}>
          <Text style={styles.chipIcon}>🪙</Text>
          <Text style={styles.chipText} numberOfLines={1}>
            {selectedWallet?.name ?? "Ví tiền"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.chip} onPress={() => setShowCatPicker(true)}>
          <Text style={styles.chipIcon}>🗂️</Text>
          <Text style={[styles.chipText, !category && styles.chipPlaceholder]} numberOfLines={1}>
            {category ?? (isExpense ? "Danh mục" : "Nhãn")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.chip} onPress={() => { setCalendarDate(date); setShowDatePicker(true); }}>
          <Text style={styles.chipIcon}>📅</Text>
          <Text style={styles.chipText}>{dateLabel}</Text>
        </TouchableOpacity>
      </View>

      {/* ── Numpad + Action buttons ── */}
      <View style={styles.numpadArea}>
        <View style={styles.numpadRow}>
          {/* Left col: number grid */}
          <View style={styles.numpadLeft}>
            <View style={styles.padRow}>
              <TouchableOpacity style={styles.padKey} onPress={() => handlePad("1")} activeOpacity={0.6}>
                <Text style={styles.padKeyText}>1</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.padKey} onPress={() => handlePad("2")} activeOpacity={0.6}>
                <Text style={styles.padKeyText}>2</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.padKey} onPress={() => handlePad("3")} activeOpacity={0.6}>
                <Text style={styles.padKeyText}>3</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.padKeyDark} onPress={() => handlePad("⌫")} activeOpacity={0.6}>
                <Ionicons name="backspace-outline" size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <View style={styles.padRow}>
              <TouchableOpacity style={styles.padKey} onPress={() => handlePad("4")} activeOpacity={0.6}>
                <Text style={styles.padKeyText}>4</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.padKey} onPress={() => handlePad("5")} activeOpacity={0.6}>
                <Text style={styles.padKeyText}>5</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.padKey} onPress={() => handlePad("6")} activeOpacity={0.6}>
                <Text style={styles.padKeyText}>6</Text>
              </TouchableOpacity>
              <View style={styles.padKeyEmpty} />
            </View>
            <View style={styles.padRow}>
              <TouchableOpacity style={styles.padKey} onPress={() => handlePad("7")} activeOpacity={0.6}>
                <Text style={styles.padKeyText}>7</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.padKey} onPress={() => handlePad("8")} activeOpacity={0.6}>
                <Text style={styles.padKeyText}>8</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.padKey} onPress={() => handlePad("9")} activeOpacity={0.6}>
                <Text style={styles.padKeyText}>9</Text>
              </TouchableOpacity>
              <View style={styles.padKeyEmpty} />
            </View>
            <View style={styles.padRow}>
              <TouchableOpacity style={styles.padKey} onPress={() => handlePad("000")} activeOpacity={0.6}>
                <Text style={styles.padKeyText}>000</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.padKey} onPress={() => handlePad("0")} activeOpacity={0.6}>
                <Text style={styles.padKeyText}>0</Text>
              </TouchableOpacity>
              <View style={styles.padKeyEmpty} />
              <View style={styles.padKeyEmpty} />
            </View>
          </View>

          {/* Right col: action button */}
          <View style={styles.numpadRight}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnGreen, isSaving && styles.actionBtnDisabled]}
              onPress={() => doSave(false)}
              disabled={isSaving}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark" size={22} color="#fff" />
              <Text style={styles.actionBtnText}>Lưu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ── Bottom Sheets ── */}
      <BottomSheet visible={showCatPicker} onClose={() => setShowCatPicker(false)} title="Chọn danh mục" snapHeight={520}>
        <CategoryPicker
          selected={categoryId || category}
          onSelect={(selected) => {
            setCategory(selected.name);
            setCategoryId(selected.id);
            setShowCatPicker(false);
          }}
        />
      </BottomSheet>

      <BottomSheet visible={showEmotionPicker} onClose={() => setShowEmotionPicker(false)} title="Bạn cảm thấy thế nào?" snapHeight={280}>
        <View style={styles.emotionRow}>
          {emotions.map((emo) => {
            const active = emotionId === emo.id;
            return (
              <TouchableOpacity
                key={emo.id}
                style={[styles.emotionItem, active && styles.emotionItemActive]}
                onPress={() => {
                  setEmotionId(active ? null : emo.id);
                  setShowEmotionPicker(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.emotionEmoji}>{emo.emoji}</Text>
                <Text
                  style={[styles.emotionLabel, active && styles.emotionLabelActive]}
                  numberOfLines={1}
                >
                  {emo.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </BottomSheet>

      <BottomSheet visible={showWalletPick} onClose={() => setShowWalletPick(false)} title="Chọn ví tiền" snapHeight={360}>
        <View style={{ paddingTop: spacing.sm }}>
          {wallets.map((w) => (
            <TouchableOpacity
              key={w.id}
              onPress={() => {
                setWalletId(w.id);
                setShowWalletPick(false);
              }}
            >
              <WalletCard
                name={w.name}
                balance={w.balance}
                icon={w.icon}
                color={w.color}
                isDefault={w.isDefault}
                selected={walletId === w.id}
              />
            </TouchableOpacity>
          ))}
        </View>
      </BottomSheet>
      <BottomSheet visible={showDatePicker} onClose={() => setShowDatePicker(false)} title="Chọn ngày" snapHeight={460}>
        <CalendarPicker
          selected={date}
          calendarDate={calendarDate}
          onChangeMonth={setCalendarDate}
          onSelect={(d) => {
            setDate(d);
            setShowDatePicker(false);
          }}
        />
      </BottomSheet>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // ── Header ──────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.base,
    paddingBottom: spacing.sm,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
    justifyContent: "center",
    alignItems: "center",
  },
  togglePill: {
    flexDirection: "row",
    backgroundColor: colors.surfaceTint,
    borderRadius: borderRadius.full,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  toggleActive: {
    backgroundColor: colors.accent,
  },
  toggleArrow: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  toggleText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.family.medium,
    color: colors.textSecondary,
  },
  toggleTextActive: {
    color: colors.primaryDark,
    fontFamily: typography.family.semiBold,
  },

  // ── Center area ──────────────────────────────────────────────
  centerArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: spacing.md,
  },
  catIconWrap: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accentSoft,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.base,
    ...shadows.soft,
  },
  catEmoji: {
    fontSize: typography.fontSize.xxxl,
  },
  emotionHint: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.family.medium,
    color: colors.textSecondary,
    marginBottom: spacing.base,
  },
  emotionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    paddingTop: spacing.sm,
  },
  emotionItem: {
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.lg,
    width: "18%",
  },
  emotionItemActive: {
    backgroundColor: colors.surfaceAlt,
  },
  emotionEmoji: {
    fontSize: typography.fontSize.xxl,
    marginBottom: spacing.xxs,
  },
  emotionLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.family.medium,
    color: colors.textSecondary,
    textAlign: "center",
  },
  emotionLabelActive: {
    color: colors.primary,
    fontFamily: typography.family.semiBold,
  },
  amountDisplay: {
    fontSize: typography.fontSize.h1,
    fontFamily: typography.family.bold,
    letterSpacing: -1,
    marginBottom: spacing.sm,
  },
  noteInput: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.family.regular,
    color: colors.textSecondary,
    paddingVertical: spacing.xxs,
    minWidth: 160,
    textAlign: "center",
  },

  // ── Chips bar ────────────────────────────────────────────────
  chipsBar: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    backgroundColor: colors.accentSoft,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  chip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    gap: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipIcon: { fontSize: typography.fontSize.sm },
  chipText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.family.medium,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  chipPlaceholder: {
    color: colors.textMuted,
  },

  // ── Numpad ───────────────────────────────────────────────────
  numpadArea: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  numpadRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "stretch",
  },
  numpadLeft: {
    flex: 1,
    gap: 8,
  },
  numpadRight: {
    width: 82,
    gap: 8,
    justifyContent: "space-between",
  },
  padRow: {
    flexDirection: "row",
    gap: 8,
  },
  padKey: {
    flex: 1,
    height: 52,
    backgroundColor: colors.elevated,
    borderRadius: borderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.soft,
  },
  padKeyDark: {
    flex: 1,
    height: 52,
    backgroundColor: colors.botanical,
    borderRadius: borderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  padKeyEmpty: {
    flex: 1,
    height: 52,
  },
  padKeyText: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.family.medium,
    color: colors.textPrimary,
  },

  // Action buttons — chiếm toàn bộ chiều cao numpadRight (2 buttons = 2 rows each)
  actionBtn: {
    flex: 1,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xxs,
    paddingVertical: spacing.xs,
  },
  actionBtnBlue: {
    backgroundColor: colors.info,
  },
  actionBtnGreen: {
    backgroundColor: colors.success,
  },
  actionBtnDisabled: {
    opacity: 0.6,
  },
  actionBtnText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.family.medium,
    color: colors.textInverse,
    textAlign: "center",
    lineHeight: 14,
  },
});

import React, { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useSelector, useDispatch } from "react-redux";
import {
  deleteWallet,
  fetchWalletSummary,
} from "../../store/slices/walletSlice";
import WalletHeroCard from "./components/WalletHeroCard";
import WalletQuickActions from "./components/WalletQuickActions";
import PaymentWalletSection from "./components/PaymentWalletSection";
import ExpenseHistorySection from "./components/ExpenseHistorySection";
import { enrichExpenses } from "./utils/expenseHistory";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

export default function MyWallets({ navigation }) {
  const dispatch = useDispatch();
  const wallets = useSelector((state) => state.wallets.wallets);
  const transactions = useSelector((state) => state.transactions.transactions);
  const categories = useSelector((state) => state.categories.categories);
  const emotions = useSelector((state) => state.emotions.emotions);

  const expenseHistory = useMemo(
    () => enrichExpenses({ transactions, wallets, categories, emotions }),
    [categories, emotions, transactions, wallets],
  );

  // Split wallets by type: "payment" wallets are spendable balances, "tracking"
  // wallets (e.g. savings) are monitored separately. Tổng tài sản = both combined,
  // so a savings wallet is never lumped into the Thanh toán figure.
  const paymentWallets = wallets.filter((wallet) => wallet.type === "payment");
  const trackingWallets = wallets.filter((wallet) => wallet.type === "tracking");
  const paymentBalance = paymentWallets.reduce((sum, wallet) => sum + wallet.balance, 0);
  const trackedBalance = trackingWallets.reduce((sum, wallet) => sum + wallet.balance, 0);
  const totalBalance = paymentBalance + trackedBalance;

  const handleDelete = (wallet) => {
    Alert.alert("Xoá ví", `Bạn có chắc muốn xoá ví "${wallet.name}"?`, [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Xoá",
        style: "destructive",
        onPress: async () => {
          try {
            await dispatch(deleteWallet(wallet.id)).unwrap();
            dispatch(fetchWalletSummary());
          } catch (error) {
            Alert.alert("Không xoá được ví", error || "Vui lòng thử lại.");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Animated.View entering={FadeInUp.duration(500)}>
          <WalletHeroCard
            totalBalance={totalBalance}
            paymentBalance={paymentBalance}
            trackedBalance={trackedBalance}
          />
        </Animated.View>

        <WalletQuickActions navigation={navigation} />

        <PaymentWalletSection
          wallets={paymentWallets}
          onAddWallet={() => navigation.navigate("AddWallet")}
          onOpenWallet={(wallet) =>
            navigation.navigate("WalletDetail", { walletId: wallet.id })
          }
          onDeleteWallet={handleDelete}
        />

        {trackingWallets.length > 0 && (
          <PaymentWalletSection
            title="Ví theo dõi"
            emptyText="Chưa có ví theo dõi nào."
            showAdd={false}
            wallets={trackingWallets}
            onOpenWallet={(wallet) =>
              navigation.navigate("WalletDetail", { walletId: wallet.id })
            }
            onDeleteWallet={handleDelete}
          />
        )}

        <ExpenseHistorySection
          expenses={expenseHistory.slice(0, 5)}
          onOpenAll={() => navigation.navigate("ExpenseHistory")}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingTop: spacing.lg,
    paddingBottom: 128,
  },
});

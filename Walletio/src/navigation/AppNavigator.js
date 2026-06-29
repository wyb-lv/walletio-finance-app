import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useDispatch, useSelector } from "react-redux";
import Toast from "../components/common/Toast";
import TabNavigator from "./TabNavigator";
import { fetchAnalyticsBalance, fetchAnalyticsSummary } from "../store/slices/analyticSlice";
import { fetchBudgets, fetchBudgetAllocations } from "../store/slices/budgetSlice";
import { fetchCategories } from "../store/slices/categorySlice";
import { fetchSpendingGroups } from "../store/slices/spendingGroupSlice";
import { fetchEmotions } from "../store/slices/emotionSlice";
import { fetchTransactions } from "../store/slices/transactionSlice";
import { fetchTransfers } from "../store/slices/transferSlice";
import { fetchWallets, fetchWalletSummary } from "../store/slices/walletSlice";

// Auth screens
import Login from "../screens/Auth/Login";
import Register from "../screens/Auth/Register";

// Push screens
import Transactions from "../screens/Transactions";
import BudgetPlanning from "../screens/BudgetPlanning";
import TransactionDetail from "../screens/Transactions/TransactionDetail";
import WalletDetail from "../screens/MyWallets/WalletDetail";
import TransferHistory from "../screens/MyWallets/TransferHistory";
import ExpenseHistory from "../screens/MyWallets/ExpenseHistory";
import CategoryManagement from "../screens/Categories/CategoryManagement";
import EditCategory from "../screens/Categories/EditCategory";
import DeleteCategory from "../screens/Categories/DeleteCategory";
import SpendingGroupManagement from "../screens/SpendingGroups/SpendingGroupManagement";
import EditSpendingGroup from "../screens/SpendingGroups/EditSpendingGroup";
import DeleteSpendingGroup from "../screens/SpendingGroups/DeleteSpendingGroup";

// Modal screens
import AddWalletModal from "../screens/MyWallets/AddWalletModal";
import EditWalletModal from "../screens/MyWallets/EditWalletModal";
import TransferMoneyModal from "../screens/MyWallets/TransferMoneyModal";
import AddBudgetModal from "../screens/BudgetPlanning/AddBudgetModal";
import EditBudgetModal from "../screens/BudgetPlanning/EditBudgetModal";
import BudgetStructureEditor from "../screens/BudgetPlanning/BudgetStructureEditor";
import CreateTransaction from "../screens/CreateTransaction";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [authToast, setAuthToast] = useState({ visible: false, message: "", type: "success" });
  const prevUserRef = useRef(null);

  // Notify on successful login/registration (when the session first becomes active).
  useEffect(() => {
    if (!prevUserRef.current && user) {
      setAuthToast({
        visible: true,
        message: `Đăng nhập thành công. Xin chào, ${user.name || "bạn"}!`,
        type: "success",
      });
    }
    prevUserRef.current = user;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const hydrate = async () => {
      await Promise.allSettled([
        dispatch(fetchCategories()),
        dispatch(fetchSpendingGroups()),
        dispatch(fetchEmotions()),
        dispatch(fetchWallets()),
        dispatch(fetchWalletSummary()),
      ]);
      dispatch(fetchTransactions());
      dispatch(fetchTransfers());
      dispatch(fetchBudgets());
      dispatch(fetchBudgetAllocations());
      dispatch(fetchAnalyticsSummary(new Date().getFullYear()));
      dispatch(fetchAnalyticsBalance());
    };
    hydrate();
  }, [dispatch, user]);

  if (!user) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
      </Stack.Navigator>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Toast
        visible={authToast.visible}
        message={authToast.message}
        type={authToast.type}
        onHide={() => setAuthToast((p) => ({ ...p, visible: false }))}
      />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />

      <Stack.Screen name="Transactions" component={Transactions} />
      <Stack.Screen name="BudgetPlanning" component={BudgetPlanning} />
      <Stack.Screen name="TransactionDetail" component={TransactionDetail} />
      <Stack.Screen name="WalletDetail" component={WalletDetail} />
      <Stack.Screen name="TransferHistory" component={TransferHistory} />
      <Stack.Screen name="ExpenseHistory" component={ExpenseHistory} />
      <Stack.Screen name="CategoryManagement" component={CategoryManagement} />
      <Stack.Screen name="EditCategory" component={EditCategory} />
      <Stack.Screen name="DeleteCategory" component={DeleteCategory} />
      <Stack.Screen
        name="SpendingGroupManagement"
        component={SpendingGroupManagement}
      />
      <Stack.Screen name="EditSpendingGroup" component={EditSpendingGroup} />
      <Stack.Screen name="DeleteSpendingGroup" component={DeleteSpendingGroup} />

      <Stack.Screen
        name="CreateTransaction"
        component={CreateTransaction}
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="AddWallet"
        component={AddWalletModal}
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="EditWallet"
        component={EditWalletModal}
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="TransferMoney"
        component={TransferMoneyModal}
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="AddBudget"
        component={AddBudgetModal}
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="EditBudget"
        component={EditBudgetModal}
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="BudgetStructureEditor"
        component={BudgetStructureEditor}
        options={{ presentation: "modal" }}
      />
      </Stack.Navigator>
    </View>
  );
}

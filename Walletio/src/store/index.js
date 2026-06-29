import { configureStore } from "@reduxjs/toolkit";
import { authReducer }        from "./slices/authSlice";
import { walletReducer }      from "./slices/walletSlice";
import { transactionReducer } from "./slices/transactionSlice";
import { budgetReducer }      from "./slices/budgetSlice";
import { categoryReducer }    from "./slices/categorySlice";
import { spendingGroupReducer } from "./slices/spendingGroupSlice";
import { emotionReducer }     from "./slices/emotionSlice";
import { transferReducer }    from "./slices/transferSlice";
import { analyticReducer }    from "./slices/analyticSlice";

export const mystore = configureStore({
  reducer: {
    auth: authReducer,
    wallets: walletReducer,
    transactions: transactionReducer,
    budget: budgetReducer,
    categories: categoryReducer,
    spendingGroups: spendingGroupReducer,
    emotions: emotionReducer,
    transfers: transferReducer,
    analytics: analyticReducer,
  },
});

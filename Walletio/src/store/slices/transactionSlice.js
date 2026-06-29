import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { transactionService } from "../../services/transactionService";

const fmtDate = (value = new Date()) => {
  if (typeof value === "string" && value.includes("/")) return value;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const parseDateParts = (dateText = "") => {
  if (dateText.includes("/")) {
    const [day, month, year] = dateText.split("/").map(Number);
    return { day, month, year, date: new Date(year, month - 1, day) };
  }
  const date = new Date(dateText);
  return {
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear(),
    date,
  };
};

const isBackendId = (id) =>
  Boolean(id) &&
  !String(id).startsWith("cat_") &&
  !String(id).startsWith("emotion_") &&
  !String(id).startsWith("local_");

const findByName = (items = [], name, keys = ["name", "label"]) =>
  items.find((item) => keys.some((key) => item[key] === name));

const normalizeTransaction = (item = {}, state, fallback = {}) => {
  const wallets = state?.wallets?.wallets ?? [];
  const categories = state?.categories?.categories ?? [];
  const emotions = state?.emotions?.emotions ?? [];
  const direction = item.direction ?? fallback.direction ?? (fallback.type === "income" ? "in" : "out");
  const type = direction === "in" ? "income" : "expense";
  const categoryName = item.category_name ?? fallback.category ?? (type === "income" ? "Thu nhập" : "Khác");
  const wallet = item.wallet_id
    ? wallets.find((walletItem) => walletItem.id === item.wallet_id)
    : findByName(wallets, item.wallet_name);
  const category = item.category_id
    ? categories.find((categoryItem) => categoryItem.id === item.category_id)
    : findByName(categories, categoryName);
  const emotion = item.emotion_id
    ? emotions.find((emotionItem) => emotionItem.id === item.emotion_id)
    : findByName(emotions, item.emotion_label, ["label"]);
  const date = fmtDate(item.expense_date ?? fallback.expense_date ?? fallback.date ?? new Date());

  return {
    id: item.id ?? fallback.id,
    amount: Number(item.amount ?? fallback.amount ?? 0),
    direction,
    type,
    note: item.note ?? fallback.note ?? "",
    description: item.note ?? fallback.description ?? categoryName,
    date,
    expense_date: date,
    walletId: item.wallet_id ?? fallback.walletId ?? wallet?.id ?? null,
    walletName: item.wallet_name ?? wallet?.name ?? fallback.walletName,
    categoryId: item.category_id ?? fallback.categoryId ?? category?.id,
    category: categoryName,
    emotionId: item.emotion_id ?? fallback.emotionId ?? emotion?.id,
    emotionLabel: item.emotion_label ?? emotion?.label ?? fallback.emotionLabel,
    budgetId: item.budget_id ?? fallback.budgetId,
    budgetName: item.budget_name ?? fallback.budgetName,
  };
};

const toExpensePayload = (txData = {}) => {
  const direction = txData.direction ?? (txData.type === "income" ? "in" : "out");
  return {
    wallet_id: txData.walletId ?? txData.wallet_id ?? null,
    direction,
    amount: Number(txData.amount ?? 0),
    note: txData.note || txData.description || null,
    category_id: isBackendId(txData.categoryId) ? txData.categoryId : null,
    emotion_id: isBackendId(txData.emotionId) ? txData.emotionId : null,
    budget_id: isBackendId(txData.budgetId) ? txData.budgetId : null,
  };
};

const initialState = {
  transactions: [],
  status: "",
  error: null,
};

export const fetchTransactions = createAsyncThunk(
  "/transaction/fetchTransactions",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) throw new Error("Bạn cần đăng nhập lại.");
      const data = await transactionService.getAll(token);
      const state = getState();
      return Array.isArray(data)
        ? data.map((item) => normalizeTransaction(item, state))
        : [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const createTransaction = createAsyncThunk(
  "/transaction/createTransaction",
  async (txData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) throw new Error("Bạn cần đăng nhập lại.");
      const data = await transactionService.create(token, toExpensePayload(txData));
      return normalizeTransaction(data?.data ?? data, getState(), txData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateTransaction = createAsyncThunk(
  "/transaction/updateTransaction",
  async ({ id, ...txData }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) throw new Error("Bạn cần đăng nhập lại.");
      const data = await transactionService.update(token, id, toExpensePayload(txData));
      return normalizeTransaction(data?.data ?? data, getState(), { id, ...txData });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteTransaction = createAsyncThunk(
  "/transaction/deleteTransaction",
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) throw new Error("Bạn cần đăng nhập lại.");
      await transactionService.delete(token, id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const transactionSlice = createSlice({
  name: "transaction",
  initialState,
  reducers: {
    createTransactionLocal: (state, action) => {
      state.transactions.unshift(
        normalizeTransaction({ id: "local_tx_" + Date.now() }, null, action.payload),
      );
      state.status = "success";
    },
    updateTransactionLocal: (state, action) => {
      const { id, ...updates } = action.payload;
      const index = state.transactions.findIndex((transaction) => transaction.id === id);
      if (index !== -1) state.transactions[index] = { ...state.transactions[index], ...updates };
      state.status = "success";
    },
    deleteTransactionLocal: (state, action) => {
      state.transactions = state.transactions.filter((transaction) => transaction.id !== action.payload);
      state.status = "success";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload;
        state.status = "success";
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.status = "fail";
        state.error = action.payload ?? action.error.message;
      })

      .addCase(createTransaction.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.transactions.unshift(action.payload);
        state.status = "success";
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.status = "fail";
        state.error = action.payload ?? action.error.message;
      })

      .addCase(updateTransaction.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        const idx = state.transactions.findIndex((transaction) => transaction.id === action.payload.id);
        if (idx !== -1) state.transactions[idx] = action.payload;
        state.status = "success";
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.status = "fail";
        state.error = action.payload ?? action.error.message;
      })

      .addCase(deleteTransaction.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.transactions = state.transactions.filter(
          (transaction) => transaction.id !== action.payload,
        );
        state.status = "success";
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.status = "fail";
        state.error = action.payload ?? action.error.message;
      });
  },
});

export const selectTransactionsByMonth = (state, month, year) =>
  state.transactions.transactions.filter((transaction) => {
    const parts = parseDateParts(transaction.date);
    return parts.month === month && parts.year === year;
  });

export const selectMonthlySummary = (state, month, year) => {
  const txs = selectTransactionsByMonth(state, month, year);
  const income = txs
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const expense = txs
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  return { income, expense, net: income - expense };
};

export const selectExpenseByCategory = (state, month, year) => {
  const txs = selectTransactionsByMonth(state, month, year).filter(
    (transaction) => transaction.type === "expense",
  );
  const map = {};
  txs.forEach((transaction) => {
    const name = transaction.category || "Khác";
    if (!map[name]) map[name] = 0;
    map[name] += transaction.amount;
  });
  return Object.entries(map).map(([name, amount]) => ({ name, amount }));
};

export const { createTransactionLocal, updateTransactionLocal, deleteTransactionLocal } =
  transactionSlice.actions;
export const transactionReducer = transactionSlice.reducer;

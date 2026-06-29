import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { walletService } from "../../services/walletService";
import { transferService } from "../../services/transferService";

const walletVisual = (wallet, index = 0) => {
  const payment = toWalletType(wallet.type) === "payment";
  return {
    icon: payment ? "card-outline" : "analytics-outline",
    color: payment ? "#2F9E69" : "#4E93B6",
    isDefault: index === 0,
  };
};

const toWalletType = (type = "payment") =>
  ["payment", "cash", "bank", "ewallet"].includes(type) ? "payment" : "tracking";

const normalizeWallet = (wallet = {}, index = 0) => ({
  id: wallet.wallet_id ?? wallet.id,
  userId: wallet.user_id,
  name: wallet.name ?? "Ví",
  type: toWalletType(wallet.type),
  openingBalance: Number(wallet.opening_balance ?? 0),
  balance: Number(wallet.balance ?? wallet.opening_balance ?? 0),
  ...walletVisual(wallet, index),
});

const toWalletPayload = (wallet = {}) => ({
  name: wallet.name,
  type: toWalletType(wallet.type),
  opening_balance: Number(wallet.openingBalance ?? wallet.opening_balance ?? wallet.balance ?? 0),
});

const initialState = {
  wallets: [],
  summary: { total: 0, payment: 0, tracking: 0 },
  status: "",
  error: null,
};

export const fetchWallets = createAsyncThunk(
  "/wallet/fetchWallets",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) throw new Error("Bạn cần đăng nhập lại.");
      const data = await walletService.getAll(token);
      return Array.isArray(data) ? data.map(normalizeWallet) : [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchWalletSummary = createAsyncThunk(
  "/wallet/fetchWalletSummary",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) throw new Error("Bạn cần đăng nhập lại.");
      return await walletService.getSummary(token);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const addWallet = createAsyncThunk(
  "/wallet/addWallet",
  async (wallet, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) throw new Error("Bạn cần đăng nhập lại.");
      const data = await walletService.create(token, toWalletPayload(wallet));
      return normalizeWallet(data?.data ?? data);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateWallet = createAsyncThunk(
  "/wallet/updateWallet",
  async ({ id, ...updates }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) throw new Error("Bạn cần đăng nhập lại.");
      const current = getState().wallets.wallets.find((wallet) => wallet.id === id);
      const data = await walletService.update(token, id, toWalletPayload({ ...current, ...updates }));
      return normalizeWallet(data?.data ?? data, 0);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteWallet = createAsyncThunk(
  "/wallet/deleteWallet",
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) throw new Error("Bạn cần đăng nhập lại.");
      await walletService.delete(token, id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const transferBetweenWallets = createAsyncThunk(
  "/wallet/transfer",
  async ({ fromId, toId, amount, note }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) throw new Error("Bạn cần đăng nhập lại.");
      const data = await transferService.create(token, {
        from_wallet_id: fromId,
        to_wallet_id: toId,
        amount,
        transfer_date: new Date().toISOString(),
        note: note || null,
      });
      return data?.data ?? data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    addWalletLocal: (state, action) => {
      state.wallets.push({
        id: "local_wallet_" + Date.now(),
        balance: 0,
        type: "payment",
        color: "#2F7D5A",
        icon: "wallet-outline",
        isDefault: false,
        ...action.payload,
      });
      state.status = "success";
    },
    updateWalletLocal: (state, action) => {
      const { id, isDefault, ...updates } = action.payload;
      const index = state.wallets.findIndex((wallet) => wallet.id === id);
      if (index === -1) return;
      if (isDefault) {
        state.wallets.forEach((wallet) => {
          wallet.isDefault = wallet.id === id;
        });
      }
      state.wallets[index] = {
        ...state.wallets[index],
        ...updates,
        isDefault: Boolean(isDefault) || state.wallets[index].isDefault,
      };
      state.status = "success";
    },
    deleteWalletLocal: (state, action) => {
      state.wallets = state.wallets.filter((wallet) => wallet.id !== action.payload);
      if (state.wallets.length > 0 && !state.wallets.some((wallet) => wallet.isDefault)) {
        state.wallets[0].isDefault = true;
      }
      state.status = "success";
    },
    transferWalletsLocal: (state, action) => {
      const { fromId, toId, amount } = action.payload;
      const from = state.wallets.find((wallet) => wallet.id === fromId);
      const to = state.wallets.find((wallet) => wallet.id === toId);
      if (from) from.balance -= amount;
      if (to) to.balance += amount;
      state.summary.total = state.wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
      state.status = "success";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWallets.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(fetchWallets.fulfilled, (state, action) => {
        state.wallets = action.payload;
        state.summary = action.payload.reduce(
          (summary, wallet) => {
            summary.total += wallet.balance;
            if (wallet.type === "tracking") summary.tracking += wallet.balance;
            else summary.payment += wallet.balance;
            return summary;
          },
          { total: 0, payment: 0, tracking: 0 },
        );
        state.status = "success";
      })
      .addCase(fetchWallets.rejected, (state, action) => {
        state.status = "fail";
        state.error = action.payload ?? action.error.message;
      })

      .addCase(fetchWalletSummary.fulfilled, (state, action) => {
        state.summary = {
          total: Number(action.payload?.total ?? 0),
          payment: Number(action.payload?.payment ?? 0),
          tracking: Number(action.payload?.tracking ?? 0),
        };
      })

      .addCase(addWallet.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(addWallet.fulfilled, (state, action) => {
        state.wallets.push(action.payload);
        state.status = "success";
      })
      .addCase(addWallet.rejected, (state, action) => {
        state.status = "fail";
        state.error = action.payload ?? action.error.message;
      })

      .addCase(updateWallet.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(updateWallet.fulfilled, (state, action) => {
        const index = state.wallets.findIndex((wallet) => wallet.id === action.payload.id);
        if (index !== -1) state.wallets[index] = { ...state.wallets[index], ...action.payload };
        state.status = "success";
      })
      .addCase(updateWallet.rejected, (state, action) => {
        state.status = "fail";
        state.error = action.payload ?? action.error.message;
      })

      .addCase(deleteWallet.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(deleteWallet.fulfilled, (state, action) => {
        state.wallets = state.wallets.filter((wallet) => wallet.id !== action.payload);
        if (state.wallets.length > 0 && !state.wallets.some((wallet) => wallet.isDefault)) {
          state.wallets[0].isDefault = true;
        }
        state.status = "success";
      })
      .addCase(deleteWallet.rejected, (state, action) => {
        state.status = "fail";
        state.error = action.payload ?? action.error.message;
      })

      .addCase(transferBetweenWallets.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(transferBetweenWallets.fulfilled, (state) => {
        state.status = "success";
      })
      .addCase(transferBetweenWallets.rejected, (state, action) => {
        state.status = "fail";
        state.error = action.payload ?? action.error.message;
      });
  },
});

export const selectTotalBalance = (state) =>
  state.wallets.summary?.total ??
  state.wallets.wallets.reduce((sum, wallet) => sum + wallet.balance, 0);

export const { addWalletLocal, updateWalletLocal, deleteWalletLocal, transferWalletsLocal } =
  walletSlice.actions;
export const walletReducer = walletSlice.reducer;

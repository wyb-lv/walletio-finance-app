import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { transferService } from "../../services/transferService";

const fmtDate = (value = new Date()) => {
  if (typeof value === "string" && value.includes("/")) return value;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const normalizeTransfer = (transfer = {}) => ({
  id: transfer.id,
  fromId: transfer.from_wallet_id ?? transfer.fromId,
  toId: transfer.to_wallet_id ?? transfer.toId,
  amount: Number(transfer.amount ?? 0),
  date: fmtDate(transfer.transfer_date ?? transfer.date),
  transferDate: transfer.transfer_date ?? transfer.date,
  note: transfer.note ?? "",
});

const initialState = {
  transfers: [],
  status: "",
  error: null,
};

export const fetchTransfers = createAsyncThunk(
  "/transfer/fetchTransfers",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) throw new Error("Bạn cần đăng nhập lại.");
      const data = await transferService.getAll(token);
      return Array.isArray(data) ? data.map(normalizeTransfer) : [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const createTransfer = createAsyncThunk(
  "/transfer/createTransfer",
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
      return normalizeTransfer(data?.data ?? data);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteTransfer = createAsyncThunk(
  "/transfer/deleteTransfer",
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) throw new Error("Bạn cần đăng nhập lại.");
      await transferService.delete(token, id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const transferSlice = createSlice({
  name: "transfers",
  initialState,
  reducers: {
    addTransfer: (state, action) => {
      state.transfers.unshift(
        normalizeTransfer({
          id: "local_transfer_" + Date.now(),
          transfer_date: new Date().toISOString(),
          ...action.payload,
        }),
      );
    },
    deleteTransferLocal: (state, action) => {
      state.transfers = state.transfers.filter((transfer) => transfer.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransfers.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(fetchTransfers.fulfilled, (state, action) => {
        state.transfers = action.payload;
        state.status = "success";
      })
      .addCase(fetchTransfers.rejected, (state, action) => {
        state.status = "fail";
        state.error = action.payload ?? action.error.message;
      })

      .addCase(createTransfer.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(createTransfer.fulfilled, (state, action) => {
        state.transfers.unshift(action.payload);
        state.status = "success";
      })
      .addCase(createTransfer.rejected, (state, action) => {
        state.status = "fail";
        state.error = action.payload ?? action.error.message;
      })

      .addCase(deleteTransfer.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(deleteTransfer.fulfilled, (state, action) => {
        state.transfers = state.transfers.filter((transfer) => transfer.id !== action.payload);
        state.status = "success";
      })
      .addCase(deleteTransfer.rejected, (state, action) => {
        state.status = "fail";
        state.error = action.payload ?? action.error.message;
      });
  },
});

export const { addTransfer, deleteTransferLocal } = transferSlice.actions;
export const transferReducer = transferSlice.reducer;

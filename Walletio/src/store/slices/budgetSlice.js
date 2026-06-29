import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { budgetService } from "../../services/budgetService";

const now = new Date();
const currentMonth = now.getMonth() + 1;
const currentYear = now.getFullYear();

const normalizeMonthlyBudget = (budget = {}) => ({
  id: budget.id,
  name: budget.name,
  month: Number(budget.month ?? currentMonth),
  year: Number(budget.year ?? currentYear),
  amount: Number(budget.total_income ?? budget.amount ?? 0),
  createdAt: budget.created_at,
});

const isBackendId = (id) =>
  Boolean(id) &&
  !String(id).startsWith("cat_") &&
  !String(id).startsWith("local_");

const initialState = {
  budgets: [],
  monthlyBudgets: [],
  budgetRecords: [],
  status: "",
  error: null,
};

export const fetchBudgets = createAsyncThunk(
  "/budget/fetchBudgets",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) throw new Error("Bạn cần đăng nhập lại.");
      const data = await budgetService.getAll(token);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const normalizeAllocation = (row = {}) => ({
  id: row.id,
  budgetId: row.budget_id,
  categoryId: row.category_id,
  limit: Number(row.allocated ?? 0),
  month: Number(row.month ?? currentMonth),
  year: Number(row.year ?? currentYear),
  period: "monthly",
});

export const fetchBudgetAllocations = createAsyncThunk(
  "/budget/fetchAllocations",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) throw new Error("Bạn cần đăng nhập lại.");
      const data = await budgetService.getAllocations(token);
      return Array.isArray(data) ? data.map(normalizeAllocation) : [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateBudget = createAsyncThunk(
  "/budget/updateBudget",
  async ({ id, budgetId, name, amount, totalIncome, month, year }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const resolvedBudgetId = budgetId ?? id;
      if (!token) throw new Error("Bạn cần đăng nhập lại.");
      if (!resolvedBudgetId) throw new Error("Backend chưa có budget để cập nhật.");
      await budgetService.update(token, {
        budgetId: resolvedBudgetId,
        name: name ?? `Budget ${month}/${year}`,
        totalIncome: Number(totalIncome ?? amount ?? 0),
        month,
        year,
      });
      return {
        id: resolvedBudgetId,
        name: name ?? `Budget ${month}/${year}`,
        month,
        year,
        amount: Number(totalIncome ?? amount ?? 0),
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const upsertBudgetAllocation = createAsyncThunk(
  "/budget/upsertAllocation",
  async (allocation, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) throw new Error("Bạn cần đăng nhập lại.");
      if (!allocation.budgetId) throw new Error("Backend chưa có budget tháng này để phân bổ.");
      if (!isBackendId(allocation.categoryId)) {
        throw new Error("Backend chưa có API danh mục để lấy categoryId thật cho phân bổ.");
      }
      const response = await budgetService.upsertAllocation(token, {
        budgetId: allocation.budgetId,
        categoryId: allocation.categoryId,
        amount: Number(allocation.limit ?? allocation.amount ?? 0),
      });
      return {
        ...allocation,
        id: response?.data?.id ?? allocation.id ?? `${allocation.budgetId}_${allocation.categoryId}`,
        limit: Number(allocation.limit ?? allocation.amount ?? 0),
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const createBudget = createAsyncThunk(
  "/budget/createBudget",
  async ({ month, year, name } = {}, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) throw new Error("Bạn cần đăng nhập lại.");
      const response = await budgetService.create(token, { month, year, name });
      return normalizeMonthlyBudget(response?.data ?? response);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteBudget = createAsyncThunk(
  "/budget/deleteBudget",
  async (_, { rejectWithValue }) =>
    rejectWithValue("Backend hiện chưa có API xoá budget từ mobile."),
);

export const budgetSlice = createSlice({
  name: "budget",
  initialState,
  reducers: {
    setMonthlyBudgetLocal: (state, action) => {
      const { month, year, amount } = action.payload;
      const index = state.monthlyBudgets.findIndex(
        (budget) => budget.month === month && budget.year === year,
      );
      if (index !== -1) {
        state.monthlyBudgets[index].amount = amount;
      } else {
        state.monthlyBudgets.push({
          id: null,
          month,
          year,
          amount,
        });
      }
      state.status = "success";
    },
    createBudgetLocal: (state, action) => {
      const budget = {
        id: "local_budget_" + Date.now(),
        period: "monthly",
        color: "#2F7D5A",
        month: currentMonth,
        year: currentYear,
        ...action.payload,
      };
      const existingIndex = state.budgets.findIndex((item) => {
        if (!item.categoryId || !budget.categoryId) return false;
        return (
          item.categoryId === budget.categoryId &&
          item.month === budget.month &&
          item.year === budget.year
        );
      });
      if (existingIndex !== -1) {
        state.budgets[existingIndex] = {
          ...state.budgets[existingIndex],
          ...budget,
          id: state.budgets[existingIndex].id,
        };
      } else {
        state.budgets.push(budget);
      }
      state.status = "success";
    },
    updateBudgetLocal: (state, action) => {
      const { id, ...updates } = action.payload;
      const index = state.budgets.findIndex((budget) => budget.id === id);
      if (index !== -1) state.budgets[index] = { ...state.budgets[index], ...updates };
      state.status = "success";
    },
    deleteBudgetLocal: (state, action) => {
      state.budgets = state.budgets.filter((budget) => budget.id !== action.payload);
      state.status = "success";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBudgets.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.budgetRecords = action.payload;
        state.monthlyBudgets = action.payload.map(normalizeMonthlyBudget);
        state.status = "success";
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.status = "fail";
        state.error = action.payload ?? action.error.message;
      })

      .addCase(fetchBudgetAllocations.fulfilled, (state, action) => {
        // The DB is the source of truth for allocations; upserts persist
        // immediately and reappear here, so a full replace stays consistent.
        state.budgets = action.payload;
        state.status = "success";
      })
      .addCase(fetchBudgetAllocations.rejected, (state, action) => {
        state.status = "fail";
        state.error = action.payload ?? action.error.message;
      })

      .addCase(updateBudget.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(updateBudget.fulfilled, (state, action) => {
        const index = state.monthlyBudgets.findIndex((budget) => budget.id === action.payload.id);
        if (index !== -1) state.monthlyBudgets[index] = action.payload;
        else state.monthlyBudgets.push(action.payload);
        state.status = "success";
      })
      .addCase(updateBudget.rejected, (state, action) => {
        state.status = "fail";
        state.error = action.payload ?? action.error.message;
      })

      .addCase(upsertBudgetAllocation.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(upsertBudgetAllocation.fulfilled, (state, action) => {
        const index = state.budgets.findIndex(
          (budget) =>
            budget.budgetId === action.payload.budgetId &&
            budget.categoryId === action.payload.categoryId,
        );
        if (index !== -1) state.budgets[index] = { ...state.budgets[index], ...action.payload };
        else state.budgets.push(action.payload);
        state.status = "success";
      })
      .addCase(upsertBudgetAllocation.rejected, (state, action) => {
        state.status = "fail";
        state.error = action.payload ?? action.error.message;
      })

      .addCase(createBudget.fulfilled, (state, action) => {
        const index = state.monthlyBudgets.findIndex(
          (budget) =>
            budget.month === action.payload.month &&
            budget.year === action.payload.year,
        );
        if (index !== -1) state.monthlyBudgets[index] = action.payload;
        else state.monthlyBudgets.push(action.payload);
        state.status = "success";
      })
      .addCase(createBudget.rejected, (state, action) => {
        state.status = "fail";
        state.error = action.payload ?? action.error.message;
      })
      .addCase(deleteBudget.rejected, (state, action) => {
        state.status = "fail";
        state.error = action.payload ?? action.error.message;
      });
  },
});

export const selectTotalBudgetLimit = (state, month, year) => {
  const fallbackDate = new Date();
  const targetMonth = month ?? fallbackDate.getMonth() + 1;
  const targetYear = year ?? fallbackDate.getFullYear();
  return state.budget.budgets
    .filter((budget) => {
      const budgetMonth = budget.month ?? targetMonth;
      const budgetYear = budget.year ?? targetYear;
      return budgetMonth === targetMonth && budgetYear === targetYear;
    })
    .reduce((sum, budget) => sum + (budget.limit ?? 0), 0);
};

export const selectMonthlyBudget = (state, month, year) => {
  const monthlyBudgets = state.budget.monthlyBudgets ?? [];
  const monthlyBudget = monthlyBudgets.find(
    (budget) => budget.month === month && budget.year === year,
  );
  return monthlyBudget ?? { id: null, month, year, amount: 0 };
};

export const selectBudgetSummary = (state, month, year) => {
  const txs = state.transactions.transactions.filter((transaction) => {
    if (!transaction.date?.includes("/")) return false;
    const [, txMonth, txYear] = transaction.date.split("/");
    return (
      parseInt(txMonth, 10) === month &&
      parseInt(txYear, 10) === year &&
      transaction.type === "expense"
    );
  });
  const categories = state.categories?.categories ?? [];
  const groups = state.spendingGroups?.groups ?? [];
  return state.budget.budgets
    .filter((budget) => {
      const budgetMonth = budget.month ?? month;
      const budgetYear = budget.year ?? year;
      return budgetMonth === month && budgetYear === year;
    })
    .map((budget) => {
      const category = categories.find((item) => item.id === budget.categoryId);
      const group = groups.find((item) => item.id === (budget.groupId ?? category?.groupId));
      const categoryName = category?.name ?? budget.category;
      const spent = txs
        .filter(
          (transaction) =>
            transaction.categoryId === budget.categoryId ||
            transaction.category === categoryName,
        )
        .reduce((sum, transaction) => sum + transaction.amount, 0);
      return {
        ...budget,
        category: categoryName,
        categoryId: budget.categoryId ?? category?.id,
        groupId: budget.groupId ?? category?.groupId,
        groupTitle: group?.title ?? budget.groupTitle ?? "Khác",
        groupColor: group?.color,
        icon: category?.icon,
        color: budget.color ?? category?.color,
        spent,
        remaining: (budget.limit ?? 0) - spent,
      };
    });
};

export const {
  createBudgetLocal,
  updateBudgetLocal,
  deleteBudgetLocal,
  setMonthlyBudgetLocal,
} = budgetSlice.actions;
export const budgetReducer = budgetSlice.reducer;

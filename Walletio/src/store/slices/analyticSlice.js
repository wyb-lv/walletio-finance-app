import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { analyticService } from "../../services/analyticService";

const normalizeMonth = (month = {}) => ({
  month: month.month,
  income: Number(month.income ?? 0),
  expense: Number(month.expense ?? 0),
});

const normalizeCategory = (category = {}, index = 0) => ({
  id: category.category_id ?? `category_${index}`,
  name: category.category_name ?? category.name ?? "Khác",
  amount: Number(category.total ?? category.amount ?? 0),
  percent: Number(category.percentage ?? category.percent ?? 0),
});

const initialState = {
  summaries: {},
  overview: null,
  balance: null,
  status: "",
  error: null,
};

export const fetchAnalyticsSummary = createAsyncThunk(
  "/analytics/fetchSummary",
  async (year, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) throw new Error("Bạn cần đăng nhập lại.");
      const data = await analyticService.getSummary(token, year);
      return {
        year: Number(data?.year ?? year),
        months: Array.isArray(data?.months) ? data.months.map(normalizeMonth) : [],
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchAnalyticsOverview = createAsyncThunk(
  "/analytics/fetchOverview",
  async (params, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) throw new Error("Bạn cần đăng nhập lại.");
      const data = await analyticService.getOverview(token, params);
      return {
        direction: data?.direction ?? params.direction ?? "out",
        from: params.from,
        to: params.to,
        total: Number(data?.total ?? 0),
        categories: Array.isArray(data?.categories)
          ? data.categories.map(normalizeCategory)
          : [],
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchAnalyticsBalance = createAsyncThunk(
  "/analytics/fetchBalance",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) throw new Error("Bạn cần đăng nhập lại.");
      return await analyticService.getBalance(token);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const analyticSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalyticsSummary.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(fetchAnalyticsSummary.fulfilled, (state, action) => {
        state.summaries[action.payload.year] = action.payload.months;
        state.status = "success";
      })
      .addCase(fetchAnalyticsSummary.rejected, (state, action) => {
        state.status = "fail";
        state.error = action.payload ?? action.error.message;
      })

      .addCase(fetchAnalyticsOverview.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(fetchAnalyticsOverview.fulfilled, (state, action) => {
        state.overview = action.payload;
        state.status = "success";
      })
      .addCase(fetchAnalyticsOverview.rejected, (state, action) => {
        state.status = "fail";
        state.error = action.payload ?? action.error.message;
      })

      .addCase(fetchAnalyticsBalance.fulfilled, (state, action) => {
        state.balance = action.payload;
      });
  },
});

export const analyticReducer = analyticSlice.reducer;

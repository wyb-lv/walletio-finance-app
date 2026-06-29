import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { spendingGroupService } from "../../services/spendingGroupService";

// Visual palette only (icon/color) — cycled through for groups whose
// description has no icon/color meta. NOT a source of spending-group data.
const GROUP_VISUALS = [
  { icon: "shield-checkmark-outline", color: "#D85C4A" },
  { icon: "navigate-outline", color: "#4E93B6" },
  { icon: "sparkles-outline", color: "#D8A85B" },
  { icon: "school-outline", color: "#2F9E69" },
  { icon: "trending-up-outline", color: "#2F9E69" },
  { icon: "albums-outline", color: "#8B6A4E" },
];

const initialState = {
  groups: [],
  status: "",
  error: null,
};

const parseDescriptionMeta = (description) => {
  if (!description) return {};
  try {
    const meta = JSON.parse(description);
    return meta && typeof meta === "object" ? meta : {};
  } catch {
    return {};
  }
};

const fallbackVisual = (index = 0) => GROUP_VISUALS[index % GROUP_VISUALS.length];

const normalizeSpendingGroup = (group = {}, index = 0, fallback = {}) => {
  const meta = parseDescriptionMeta(group.description);
  const visual = fallbackVisual(index);
  return {
    id: group.id ?? fallback.id,
    userId: group.user_id ?? fallback.userId,
    title: group.name ?? group.title ?? fallback.title ?? "Khác",
    icon: meta.icon ?? fallback.icon ?? visual.icon ?? "albums-outline",
    color: meta.color ?? fallback.color ?? visual.color ?? "#2F7D5A",
    description: group.description ?? fallback.description ?? null,
  };
};

const toSpendingGroupPayload = (group = {}) => ({
  name: group.title ?? group.name,
  description: JSON.stringify({
    icon: group.icon ?? "albums-outline",
    color: group.color ?? "#2F7D5A",
  }),
});

export const fetchSpendingGroups = createAsyncThunk(
  "/spendingGroups/fetchSpendingGroups",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) throw new Error("Bạn cần đăng nhập lại.");
      const data = await spendingGroupService.getAll(token);
      return Array.isArray(data) ? data.map(normalizeSpendingGroup) : [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const addSpendingGroup = createAsyncThunk(
  "/spendingGroups/addSpendingGroup",
  async (group, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) throw new Error("Bạn cần đăng nhập lại.");
      const data = await spendingGroupService.create(token, toSpendingGroupPayload(group));
      return normalizeSpendingGroup(data?.data ?? data, 0, group);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateSpendingGroup = createAsyncThunk(
  "/spendingGroups/updateSpendingGroup",
  async ({ id, ...updates }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) throw new Error("Bạn cần đăng nhập lại.");
      const data = await spendingGroupService.update(token, id, toSpendingGroupPayload(updates));
      return normalizeSpendingGroup(data?.data ?? data, 0, { id, ...updates });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteSpendingGroup = createAsyncThunk(
  "/spendingGroups/deleteSpendingGroup",
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) throw new Error("Bạn cần đăng nhập lại.");
      await spendingGroupService.delete(token, id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const spendingGroupSlice = createSlice({
  name: "spendingGroups",
  initialState,
  reducers: {
    addSpendingGroupLocal: (state, action) => {
      state.groups.push({
        id: "group_" + Date.now(),
        icon: "albums-outline",
        color: "#2F7D5A",
        ...action.payload,
      });
    },
    updateSpendingGroupLocal: (state, action) => {
      const { id, ...updates } = action.payload;
      const index = state.groups.findIndex((group) => group.id === id);
      if (index !== -1) state.groups[index] = { ...state.groups[index], ...updates };
    },
    deleteSpendingGroupLocal: (state, action) => {
      state.groups = state.groups.filter((group) => group.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSpendingGroups.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(fetchSpendingGroups.fulfilled, (state, action) => {
        state.groups = action.payload;
        state.status = "success";
      })
      .addCase(fetchSpendingGroups.rejected, (state, action) => {
        state.status = "fail";
        state.error = action.payload ?? action.error.message;
      })
      .addCase(addSpendingGroup.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(addSpendingGroup.fulfilled, (state, action) => {
        state.groups.push(action.payload);
        state.status = "success";
      })
      .addCase(addSpendingGroup.rejected, (state, action) => {
        state.status = "fail";
        state.error = action.payload ?? action.error.message;
      })
      .addCase(updateSpendingGroup.fulfilled, (state, action) => {
        const index = state.groups.findIndex((group) => group.id === action.payload.id);
        if (index !== -1) state.groups[index] = { ...state.groups[index], ...action.payload };
        state.status = "success";
      })
      .addCase(updateSpendingGroup.rejected, (state, action) => {
        state.status = "fail";
        state.error = action.payload ?? action.error.message;
      })
      .addCase(deleteSpendingGroup.fulfilled, (state, action) => {
        state.groups = state.groups.filter((group) => group.id !== action.payload);
        state.status = "success";
      })
      .addCase(deleteSpendingGroup.rejected, (state, action) => {
        state.status = "fail";
        state.error = action.payload ?? action.error.message;
      });
  },
});

export const {
  addSpendingGroupLocal,
  updateSpendingGroupLocal,
  deleteSpendingGroupLocal,
} = spendingGroupSlice.actions;
export const spendingGroupReducer = spendingGroupSlice.reducer;

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { categoryService } from "../../services/categoryService";

// Visual palette only (icon/color) — cycled through for categories that
// have no icon/color of their own. NOT a source of category data.
const CATEGORY_VISUALS = [
  { icon: "restaurant-outline", color: "#D8A85B" },
  { icon: "car-outline", color: "#4E93B6" },
  { icon: "bag-outline", color: "#A855F7" },
  { icon: "game-controller-outline", color: "#C78365" },
  { icon: "medkit-outline", color: "#2F9E69" },
  { icon: "school-outline", color: "#3F7891" },
  { icon: "home-outline", color: "#8FBF8F" },
  { icon: "apps-outline", color: "#8B6A4E" },
];

const initialState = {
  categories: [],
  status: "",
  error: null,
};

const fallbackVisual = (index = 0) => CATEGORY_VISUALS[index % CATEGORY_VISUALS.length];

// Pre-migration rows packed { icon, color, ... } as JSON into the `icon` column.
// Parse it so those categories still render a valid icon/color.
const parseLegacyMeta = (icon) => {
  if (typeof icon === "string" && icon.trim().startsWith("{")) {
    try {
      const meta = JSON.parse(icon);
      return meta && typeof meta === "object" ? meta : null;
    } catch {
      return null;
    }
  }
  return null;
};

const normalizeCategory = (category = {}, index = 0, fallback = {}) => {
  const visual = fallbackVisual(index);
  const legacy = parseLegacyMeta(category.icon);
  const icon = (legacy ? legacy.icon : category.icon) ?? fallback.icon ?? visual.icon ?? "apps-outline";
  const color = (legacy ? legacy.color : category.color) ?? fallback.color ?? visual.color ?? "#2F7D5A";
  return {
    id: category.id ?? fallback.id,
    userId: category.user_id ?? fallback.userId,
    name: category.name ?? fallback.name ?? "Khác",
    icon,
    color,
    groupId: category.spending_group_id ?? fallback.groupId ?? null,
  };
};

const toCategoryPayload = (category = {}) => ({
  name: category.name,
  icon: category.icon ?? "apps-outline",
  color: category.color ?? "#2F7D5A",
  spending_group_id: category.groupId ?? null,
});

export const fetchCategories = createAsyncThunk(
  "/categories/fetchCategories",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) throw new Error("Bạn cần đăng nhập lại.");
      const data = await categoryService.getAll(token);
      return Array.isArray(data) ? data.map(normalizeCategory) : [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const addCategory = createAsyncThunk(
  "/categories/addCategory",
  async (category, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) throw new Error("Bạn cần đăng nhập lại.");
      const data = await categoryService.create(token, toCategoryPayload(category));
      return normalizeCategory(data?.data ?? data, 0, category);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateCategory = createAsyncThunk(
  "/categories/updateCategory",
  async ({ id, ...updates }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) throw new Error("Bạn cần đăng nhập lại.");
      const data = await categoryService.update(token, id, toCategoryPayload(updates));
      return normalizeCategory(data?.data ?? data, 0, { id, ...updates });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteCategory = createAsyncThunk(
  "/categories/deleteCategory",
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) throw new Error("Bạn cần đăng nhập lại.");
      await categoryService.delete(token, id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    addCategoryLocal: (state, action) => {
      state.categories.push({
        id: "cat_" + Date.now(),
        icon: "apps-outline",
        color: "#2F7D5A",
        groupId: null,
        ...action.payload,
      });
    },
    updateCategoryLocal: (state, action) => {
      const { id, ...updates } = action.payload;
      const index = state.categories.findIndex((category) => category.id === id);
      if (index !== -1) state.categories[index] = { ...state.categories[index], ...updates };
    },
    deleteCategoryLocal: (state, action) => {
      state.categories = state.categories.filter((category) => category.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
        state.status = "success";
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = "fail";
        state.error = action.payload ?? action.error.message;
      })
      .addCase(addCategory.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
        state.status = "success";
      })
      .addCase(addCategory.rejected, (state, action) => {
        state.status = "fail";
        state.error = action.payload ?? action.error.message;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex((category) => category.id === action.payload.id);
        if (index !== -1) state.categories[index] = { ...state.categories[index], ...action.payload };
        state.status = "success";
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.status = "fail";
        state.error = action.payload ?? action.error.message;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter((category) => category.id !== action.payload);
        state.status = "success";
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.status = "fail";
        state.error = action.payload ?? action.error.message;
      });
  },
});

export const { addCategoryLocal, updateCategoryLocal, deleteCategoryLocal } =
  categorySlice.actions;
export const categoryReducer = categorySlice.reducer;

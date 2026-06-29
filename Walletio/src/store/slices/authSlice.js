import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "../../services/authService";

const normalizeUser = (profile = {}, fallbackEmail = "") => {
  const email = profile.email ?? fallbackEmail;
  const name = profile.full_name ?? profile.name ?? email?.split("@")[0] ?? "Người dùng";
  return {
    id: profile.id ?? null,
    name,
    email,
    avatar: profile.avatar_url ?? profile.avatar ?? null,
  };
};

const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  status: "",
  error: null,
};

export const loginUser = createAsyncThunk(
  "/auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const session = await authService.login({ email, password });
      const token = session?.access_token ?? null;
      if (!token) throw new Error("Backend không trả về access token.");
      const profile = await authService.getProfile(token);
      return { user: normalizeUser(profile, email), token, refreshToken: session?.refresh_token ?? null };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const registerUser = createAsyncThunk(
  "/auth/registerUser",
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const data = await authService.register({ name, email, password });
      const token = data?.session?.access_token ?? data?.access_token ?? null;
      if (!token) {
        throw new Error("Đăng ký thành công. Vui lòng xác nhận email rồi đăng nhập.");
      }
      const profile = await authService.getProfile(token);
      return { user: normalizeUser(profile, email), token, refreshToken: data?.session?.refresh_token ?? null };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateProfile = createAsyncThunk(
  "/auth/updateProfile",
  async (profileData, { getState, rejectWithValue }) => {
    try {
      const { token, user } = getState().auth;
      if (!token) throw new Error("Bạn cần đăng nhập lại.");
      // Only send provided fields so a name update never clears the avatar.
      const body = {};
      const name = profileData.name ?? profileData.full_name;
      if (name !== undefined) body.full_name = name;
      const avatar = profileData.avatar_url ?? profileData.avatar;
      if (avatar !== undefined) body.avatar_url = avatar;
      const data = await authService.updateProfile(token, body);
      return normalizeUser(data, user?.email);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const uploadAvatar = createAsyncThunk(
  "/auth/uploadAvatar",
  async (imageBase64, { getState, rejectWithValue }) => {
    try {
      const { token, user } = getState().auth;
      if (!token) throw new Error("Bạn cần đăng nhập lại.");
      const data = await authService.uploadAvatar(token, imageBase64);
      return normalizeUser(data, user?.email);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const changePassword = createAsyncThunk(
  "/auth/changePassword",
  async ({ oldPassword, newPassword }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) throw new Error("Bạn cần đăng nhập lại.");
      return await authService.changePassword(token, { oldPassword, newPassword });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const logoutUser = createAsyncThunk("/auth/logoutUser", async () => null);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logoutLocal: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.status = "";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "success";
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "fail";
        state.error = action.payload ?? action.error.message;
      })

      .addCase(registerUser.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = "success";
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "fail";
        state.error = action.payload ?? action.error.message;
      })

      .addCase(updateProfile.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = "success";
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.status = "fail";
        state.error = action.payload ?? action.error.message;
      })

      .addCase(uploadAvatar.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = "success";
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.status = "fail";
        state.error = action.payload ?? action.error.message;
      })

      .addCase(changePassword.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.status = "success";
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.status = "fail";
        state.error = action.payload ?? action.error.message;
      })

      .addCase(logoutUser.pending, (state) => {
        state.status = "pending";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.status = "";
        state.error = null;
      });
  },
});

export const { logoutLocal } = authSlice.actions;
export const authReducer = authSlice.reducer;

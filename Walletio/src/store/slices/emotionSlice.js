import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { emotionService } from "../../services/emotionService";

// Maps the emotions table's emoji_key to a display emoji.
const EMOJI_BY_KEY = {
  emotion_happiest: "😄",
  emotion_happy: "🙂",
  emotion_neutral: "😐",
  emotion_sad: "🙁",
  emotion_saddest: "😢",
};

const normalizeEmotion = (emotion = {}) => ({
  id: emotion.id,
  label: emotion.label ?? "",
  emojiKey: emotion.emoji_key ?? null,
  emoji: EMOJI_BY_KEY[emotion.emoji_key] ?? "🙂",
});

const initialState = {
  emotions: [],
  status: "",
  error: null,
};

export const fetchEmotions = createAsyncThunk(
  "/emotions/fetchEmotions",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) throw new Error("Bạn cần đăng nhập lại.");
      const data = await emotionService.getAll(token);
      return Array.isArray(data) ? data.map(normalizeEmotion) : [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const emotionSlice = createSlice({
  name: "emotions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmotions.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(fetchEmotions.fulfilled, (state, action) => {
        state.emotions = action.payload;
        state.status = "success";
      })
      .addCase(fetchEmotions.rejected, (state, action) => {
        state.status = "fail";
        state.error = action.payload ?? action.error.message;
      });
  },
});

export const emotionReducer = emotionSlice.reducer;

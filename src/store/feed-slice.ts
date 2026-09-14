import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getFeedsApi, getOrderByNumberApi } from '@api';
import { TOrder } from '@utils-types';
import { RootState } from '../services/store';

export type FeedState = {
  orders: TOrder[];
  total: number;
  totalToday: number;
  isLoading: boolean;
  error: string | null;
  orderByNumber: TOrder | null;
  isOrderLoading: boolean;
};

const initialState: FeedState = {
  orders: [],
  total: 0,
  totalToday: 0,
  isLoading: false,
  error: null,
  orderByNumber: null,
  isOrderLoading: false
};

export const getFeeds = createAsyncThunk('feed/getFeeds', getFeedsApi);

export const getOrderByNumber = createAsyncThunk(
  'feed/getOrderByNumber',
  getOrderByNumberApi
);

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getFeeds.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });

    builder.addCase(getFeeds.fulfilled, (state, action) => {
      state.isLoading = false;
      state.orders = action.payload.orders;
      state.total = action.payload.total;
      state.totalToday = action.payload.totalToday;
    });

    builder.addCase(getFeeds.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Произошла ошибка';
    });

    builder.addCase(getOrderByNumber.pending, (state) => {
      state.isOrderLoading = true;
    });

    builder.addCase(getOrderByNumber.fulfilled, (state, action) => {
      state.isOrderLoading = false;
      state.orderByNumber = action.payload.orders[0];
    });

    builder.addCase(getOrderByNumber.rejected, (state) => {
      state.isOrderLoading = false;
    });
  }
});

export const selectFeedOrders = (state: RootState) => state.feed.orders;

export const selectFeedLoading = (state: RootState) => state.feed.isLoading;

export const selectFeedError = (state: RootState) => state.feed.error;

export const selectFeedTotal = (state: RootState) => state.feed.total;

export const selectFeedTotalToday = (state: RootState) => state.feed.totalToday;

export const selectOrderByNumber = (state: RootState) =>
  state.feed.orderByNumber;

export const selectOrderLoading = (state: RootState) =>
  state.feed.isOrderLoading;

export default feedSlice.reducer;

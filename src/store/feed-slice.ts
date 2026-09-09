import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getFeedsApi } from '@api';
import { TOrder } from '@utils-types';
import { RootState } from '../services/store';
import { orderBurger } from './burger-constructor-slice';

export type FeedState = {
  orders: TOrder[];
  total: number;
  totalToday: number;
  isLoading: boolean;
  error: string | null;
};

const initialState: FeedState = {
  orders: [],
  total: 0,
  totalToday: 0,
  isLoading: false,
  error: null
};

export const getFeeds = createAsyncThunk('feed/getFeeds', getFeedsApi);

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

      const serverOrders = action.payload.orders;

      const existingOrders = state.orders.filter(
        (existingOrder) =>
          !serverOrders.some(
            (serverOrder) => serverOrder._id === existingOrder._id
          )
      );

      state.orders = [...existingOrders, ...serverOrders];
      state.total = action.payload.total;
      state.totalToday = action.payload.totalToday;
    });

    builder.addCase(getFeeds.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Произошла ошибка';
    });

    builder.addCase(orderBurger.fulfilled, (state, action) => {
      const ingredients = action.meta.arg.map((ingredient) => ingredient._id);

      const newOrder: TOrder = {
        ...action.payload.order,
        name: action.payload.name,
        status: 'pending',
        ingredients,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      state.orders = [newOrder, ...state.orders];
      state.total += 1;
      state.totalToday += 1;
    });
  }
});

export const selectFeedOrders = (state: RootState) => state.feed.orders;

export const selectFeedLoading = (state: RootState) => state.feed.isLoading;

export const selectFeedError = (state: RootState) => state.feed.error;

export const selectFeedTotal = (state: RootState) => state.feed.total;

export const selectFeedTotalToday = (state: RootState) => state.feed.totalToday;

export default feedSlice.reducer;

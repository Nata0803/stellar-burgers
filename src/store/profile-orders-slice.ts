import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getOrdersApi } from '@api';
import { TOrder } from '@utils-types';
import { RootState } from '../services/store';

export type ProfileOrdersState = {
  orders: TOrder[];
  isLoading: boolean;
  error: string | null;
};

const initialState: ProfileOrdersState = {
  orders: [],
  isLoading: false,
  error: null
};

export const getOrders = createAsyncThunk(
  'profileOrders/getOrders',
  getOrdersApi
);

const profileOrdersSlice = createSlice({
  name: 'profileOrders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getOrders.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });

    builder.addCase(getOrders.fulfilled, (state, action) => {
      state.isLoading = false;
      state.orders = action.payload;
    });

    builder.addCase(getOrders.rejected, (state, action) => {
      state.isLoading = false;
      state.error =
        action.error.message || 'Не удалось загрузить историю заказов';
    });
  }
});

export const selectProfileOrders = (state: RootState) => state.orders.orders;

export const selectProfileOrdersLoading = (state: RootState) =>
  state.orders.isLoading;

export const selectProfileOrdersError = (state: RootState) =>
  state.orders.error;

export default profileOrdersSlice.reducer;

import { createSlice } from '@reduxjs/toolkit';
import { TUser } from '@utils-types';
import {
  TLoginData,
  loginUserApi,
  getUserApi,
  registerUserApi,
  updateUserApi,
  logoutApi
} from '@api';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { setCookie, deleteCookie } from '../utils/cookie';
import { RootState } from '../services/store';

type AuthState = {
  user: TUser | null;
  isAuthChecked: boolean;
  isLoading: boolean;
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  isAuthChecked: false,
  isLoading: false,
  error: null
};

export const login = createAsyncThunk('auth/login', loginUserApi);

export const register = createAsyncThunk('auth/register', registerUserApi);

export const updateUser = createAsyncThunk('auth/updateUser', updateUserApi);

export const logout = createAsyncThunk('auth/logout', logoutApi);

export const getUser = createAsyncThunk('auth/getUser', getUserApi);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });

    builder.addCase(login.fulfilled, (state, action) => {
      localStorage.setItem('refreshToken', action.payload.refreshToken);
      setCookie('accessToken', action.payload.accessToken);

      state.user = action.payload.user;
      state.isAuthChecked = true;
      state.isLoading = false;
      state.error = null;
    });

    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'error';
    });

    builder.addCase(register.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });

    builder.addCase(register.fulfilled, (state, action) => {
      localStorage.setItem('refreshToken', action.payload.refreshToken);
      setCookie('accessToken', action.payload.accessToken);

      state.user = action.payload.user;
      state.isAuthChecked = true;
      state.isLoading = false;
      state.error = null;
    });

    builder.addCase(register.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'error';
    });

    builder.addCase(updateUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });

    builder.addCase(updateUser.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.isLoading = false;
      state.error = null;
    });

    builder.addCase(updateUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'error';
    });

    builder.addCase(logout.fulfilled, (state) => {
      localStorage.removeItem('refreshToken');
      deleteCookie('accessToken');

      state.user = null;
      state.isAuthChecked = true;
      state.isLoading = false;
      state.error = null;
    });

    builder.addCase(getUser.pending, (state) => {
      state.isLoading = true;
    });

    builder.addCase(getUser.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.isAuthChecked = true;
      state.isLoading = false;
      state.error = null;
    });

    builder.addCase(getUser.rejected, (state) => {
      state.isAuthChecked = true;
      state.isLoading = false;
      state.user = null;
    });
  }
});

export const selectUser = (state: RootState) => state.auth.user;

export const selectIsAuthChecked = (state: RootState) =>
  state.auth.isAuthChecked;

export const selectAuthLoading = (state: RootState) => state.auth.isLoading;

export const selectAuthError = (state: RootState) => state.auth.error;

export default authSlice.reducer;

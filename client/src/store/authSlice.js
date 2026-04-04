import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

const initialState = {
  user: null,
  role: null, // 'doctor' or 'patient'
  isAuthenticated: false,
  isLoading: false,
};

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ formData, role }) => {
    const endpoint = role === 'doctor' ? '/api/doctor/register' : '/api/patient/register';
    const response = await axios.post(`${API}${endpoint}`, formData);
    return { ...response.data, role };
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ formData, role }) => {
    const endpoint = role === 'doctor' ? '/api/doctor/login' : '/api/patient/login';
    const response = await axios.post(`${API}${endpoint}`, formData);
    return { ...response.data, role };
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.role = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        // Don't auto-login on register
      })
      .addCase(registerUser.rejected, (state) => {
        state.isLoading = false;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          const { role } = action.payload;
          state.role = role;
          state.user = role === 'doctor' ? action.payload.doctor : action.payload.patient;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.role = null;
          state.isAuthenticated = false;
        }
      })
      .addCase(loginUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.role = null;
        state.isAuthenticated = false;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;

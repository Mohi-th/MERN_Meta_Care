import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

const initialState = {
    user: null,
}

export const registerUser = createAsyncThunk('/auth/register', async (formData) => {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/doctor/register`,
        formData, )
    return response.data
})

export const loginUser = createAsyncThunk('/auth/login', async (formData) => {
    console.log(formData)
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/doctor/login`,
        formData, )
    return response.data
})

console.log(initialState.user)




const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action) => { },
        resetTokenAndCredentials:(state)=>{
            state.isAuthenticated=false
            state.user=null
            state.token=null
        }
    },
    extraReducers: (builder) => {
        builder.addCase(registerUser.pending, (state) => {
            state.isLoading = true
        }).addCase(registerUser.fulfilled, (state, action) => {
            state.isLoading = false
            state.user = false
            state.isAuthenticated = false
        }).addCase(registerUser.rejected, (state, action) => {
            state.isLoading = false
            state.user = null
            state.isAuthenticated = false
        }).addCase(loginUser.pending, (state) => {
            state.isLoading = true
        }).addCase(loginUser.fulfilled, (state, action) => {
            state.isLoading = false
            state.user = action.payload.success ? action.payload.doctor : null
            state.isAuthenticated = action.payload.success
            state.token=action?.payload?.token
            sessionStorage.setItem('token',JSON.stringify(action.payload.token))
        }).addCase(loginUser.rejected, (state, action) => {
            state.isLoading = false
            state.user = null
            state.isAuthenticated = false
            state.token=null
        })
    }
})

export const { setUser ,resetTokenAndCredentials} = authSlice.actions
export default authSlice.reducer
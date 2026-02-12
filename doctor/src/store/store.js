import { configureStore } from '@reduxjs/toolkit';
import patientReducer from './AuthSlice';

 const store = configureStore({
  reducer: {
    doctor: patientReducer,
  },
});

export default store;

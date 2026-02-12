import { configureStore } from '@reduxjs/toolkit';
import patientReducer from './AuthSlice';

 const store = configureStore({
  reducer: {
    patient: patientReducer,
  },
});

export default store;

import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  name: String,
  phone: { type: String, unique: true },
  password: String,
});

export default mongoose.model('Patient', patientSchema);

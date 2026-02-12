import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  name: String,
  phone: { type: String, unique: true },
  experience: String,
  hospital: String,
  password: String, // optional if login required
});

export default mongoose.model('Doctor', doctorSchema);

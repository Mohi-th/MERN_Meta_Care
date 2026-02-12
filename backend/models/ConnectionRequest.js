import mongoose from 'mongoose';

const connectionRequestSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  docId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  status: { type: String, default: 'pending' } // 'pending', 'accepted', 'rejected'
});

export default mongoose.model('ConnectionRequest', connectionRequestSchema); 

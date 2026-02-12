import mongoose from 'mongoose';

const connectionSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  docId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
});

export default mongoose.model('Connection', connectionSchema);

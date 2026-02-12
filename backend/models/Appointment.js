import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  docId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',  // reference to Doctor model
    required: true,
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',  // reference to Patient model
    required: true,
  },
  scheduleTime: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

export default mongoose.model('Appointment', appointmentSchema);

import express from 'express';
const router = express.Router();
import {
  bookAppointment,
  getAvailableSlots,
  getAppointmentsForDoctor,
  getAppointmentsByPatient,
  completeAppointment,
} from '../controllers/appointmentController.js';

// Book a new appointment
router.post('/book', bookAppointment);

// Get available slots for a specific doctor
router.get('/slots/:docId', getAvailableSlots);

// Get all appointments for a doctor
router.get('/doctor/:docId', getAppointmentsForDoctor);

// Get all appointments for a patient
router.get('/patient/:patientId', getAppointmentsByPatient);

// Mark appointment as completed
router.put('/:id/complete', completeAppointment);

export default router;

import express from 'express';
const router = express.Router();
import {
  bookAppointment,
  getAvailableSlots,
  getAppointmentsForDoctor,
  getAppointmentsByPatient
} from '../controllers/appointmentController.js';

// Book a new appointment
router.post('/book', bookAppointment);

// Get available slots for a specific doctor
router.get('/slots/:docId', getAvailableSlots);

router.get('/doctor/:docId', getAppointmentsForDoctor);

router.get('/patient/:patientId', getAppointmentsByPatient);


export default router;

// routes/patientRoutes.js
import express from 'express';
const router = express.Router();
import { registerPatient, loginPatient } from '../controllers/patientController.js';

router.post('/register', registerPatient);
router.post('/login', loginPatient);

export default router;

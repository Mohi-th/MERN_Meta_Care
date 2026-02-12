// routes/doctorRoutes.js
import express from 'express';
const router = express.Router();
import { registerDoctor, loginDoctor, getAllDoctors } from '../controllers/doctorController.js';

router.post('/register', registerDoctor);
router.post('/login', loginDoctor);
router.get("/all", getAllDoctors);

export default router;

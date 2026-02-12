import express from 'express';
const router = express.Router();
import {
  sendConnectionRequest,
  updateConnectionRequestStatus,
  getDoctorConnectionRequests,
  getConnectedDoctors,
  getPatientConnectionRequests
} from '../controllers/connectionRequestController.js';

router.post('/send', sendConnectionRequest);
router.post('/update-status', updateConnectionRequestStatus);
router.get('/doctor/:docId', getDoctorConnectionRequests);
router.get('/connected/:patientId', getConnectedDoctors);
router.get(
  "/patient/:patientId",
  getPatientConnectionRequests
);


export default router;

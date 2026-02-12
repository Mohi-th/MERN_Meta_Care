import express from "express";
import {
  createSummary,
  updateSummary,
  getSummariesByDoctor,
} from "../controllers/summaryController.js";

const router = express.Router();

router.post("/create", createSummary);                 // Create new summary
router.put("/:id", updateSummary);               // Update AI summary later
router.get("/:doctorId", getSummariesByDoctor);  // Get summaries by doctor

export default router;

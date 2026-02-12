import Summary from "../models/Summary.js";

/**
 * ✅ Create a new summary (store transcript initially)
 */
export const createSummary = async (req, res) => {
  try {
    const { doctorId, patientId, transcript } = req.body;
    console.log(req.body)

    if (!doctorId || !patientId || !transcript) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newSummary = await Summary.create({
      doctorId,
      patientId,
      transcript,
    });

    res.status(201).json(newSummary);
  } catch (error) {
    console.error("❌ Error creating summary:", error);
    res.status(500).json({ error: "Failed to create summary" });
  }
};

/**
 * ✅ Update summary later (add AI-generated summary)
 */
export const updateSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const { summary } = req.body;

    if (!summary) {
      return res.status(400).json({ error: "Summary text is required" });
    }

    const updatedSummary = await Summary.findByIdAndUpdate(
      id,
      { summary },
      { new: true }
    );

    if (!updatedSummary) {
      return res.status(404).json({ error: "Summary not found" });
    }

    res.json(updatedSummary);
  } catch (error) {
    console.error("❌ Error updating summary:", error);
    res.status(500).json({ error: "Failed to update summary" });
  }
};

/**
 * ✅ Get all summaries by doctor ID (sorted by latest date)
 */
export const getSummariesByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    if (!doctorId) {
      return res.status(400).json({ error: "Doctor ID is required" });
    }

    const summaries = await Summary.find({ doctorId })
      .populate("doctorId", "name hospital")
      .populate("patientId", "name phone")
      .sort({ createdAt: -1 });

    const formattedSummaries = summaries.map((item) => ({
      _id: item._id,
      doctor: item.doctorId,
      patient: item.patientId,
      transcript: item.transcript,
      summary: item.summary,
      date: item.date,
      createdAt: item.createdAt,
    }));

    res.json(formattedSummaries);
  } catch (error) {
    console.error("❌ Error fetching summaries:", error);
    res.status(500).json({ error: "Failed to fetch summaries" });
  }
};

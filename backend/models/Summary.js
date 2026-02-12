import mongoose from "mongoose";

const summarySchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    transcript: { type: String },
    summary: { type: String },
    date: {
      type: String,
      default: () => {
        const now = new Date();
        return now.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Summary", summarySchema);

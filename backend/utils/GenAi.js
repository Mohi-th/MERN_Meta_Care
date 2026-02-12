import axios from "axios";

/**
 * Sends a doctor-patient conversation transcript to your backend
 * and returns a short, clear summary of it.
 * @param {string} conversation - The full text transcript of the doctor-patient conversation.
 * @returns {Promise<string>} - The summarized version of the conversation.
 */
export const sendSummary = async (conversation) => {
  if (!conversation || !conversation.trim()) return "No conversation provided.";

  try {
    const prompt = `
      Doctor-Patient Conversation:
      ${conversation}

      Please provide a concise summary highlighting:
      - The main topic discussed
      - Key symptoms, advice, or observations
      - Any next steps mentioned by the doctor

      Keep the summary professional, clear, and under 5 sentences.
    `;

    const response = await axios.post(
      "https://genai-backend-s3vt.onrender.com/generate",
      { prompt },
      { headers: { "Content-Type": "application/json" } }
    );

    return response.data?.text || "No summary returned.";
  } catch (error) {
    console.error("❌ Error generating summary:", error);
    return "Failed to generate summary.";
  }
};

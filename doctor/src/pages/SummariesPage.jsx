import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

// Function to generate AI summary using external GenAI API
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
      `${import.meta.env.VITE_GROQ_API}/generate`,
      { prompt },
      { headers: { "Content-Type": "application/json" } }
    );

    return response.data?.text || "No summary returned.";
  } catch (error) {
    console.error("❌ Error generating summary:", error);
    return "Failed to generate summary.";
  }
};

function SummariesPage() {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generatingId, setGeneratingId] = useState(null);

  const { user } = useSelector((state) => state.doctor);
  const doctorId = user?._id;

  // ✅ Fetch summaries by doctor ID
  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/summary/${doctorId}`);
        setSummaries(res.data);
      } catch (err) {
        console.error("Error fetching summaries:", err);
        setError("Failed to load summaries.");
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) fetchSummaries();
  }, [doctorId]);

  // ✅ Generate AI summary and update in backend
  const handleGenerateSummary = async (summaryId, transcript) => {
    setGeneratingId(summaryId);
    try {
      const aiSummary = await sendSummary(transcript);

      console.log(aiSummary)

      // Update summary in backend
      await axios.put(`${import.meta.env.VITE_API_URL}/api/summary/${summaryId}`, {
        summary: aiSummary,
      });

      // Update UI
      setSummaries((prev) =>
        prev.map((item) =>
          item._id === summaryId ? { ...item, summary: aiSummary } : item
        )
      );

      alert("✅ Summary generated successfully!");
    } catch (err) {
      console.error("Error generating summary:", err);
      alert("Failed to generate summary.");
    } finally {
      setGeneratingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-3 text-gray-500">Loading summaries...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  if (summaries.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <svg
          className="w-16 h-16 text-gray-300 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 13h6m2 0a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v4a2 2 0 002 2m2 0v6m0 0h6m-6 0a2 2 0 002 2h2a2 2 0 002-2m-6 0V13"
          />
        </svg>
        <h3 className="text-lg font-semibold text-gray-800 mb-1">No Summaries Yet</h3>
        <p className="text-gray-500">Consultation summaries will appear here after each call.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Consultation Summaries</h1>

      <div className="space-y-4">
        {summaries.map((item) => (
          <div
            key={item._id}
            className="bg-white shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition"
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">
                  Patient:{" "}
                  <span className="text-blue-600">{item.patient?.name || "Unknown"}</span>
                </h2>
                <span className="text-sm text-gray-500">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="mt-3">
                <h3 className="font-medium text-gray-700 mb-1">📝 Summary:</h3>
                <p className="text-gray-800 bg-gray-50 p-3 rounded-md border border-gray-100 leading-relaxed">
                  {item.summary || "No summary generated yet."}
                </p>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => handleGenerateSummary(item._id, item.transcript)}
                  disabled={generatingId === item._id}
                  className={`px-4 py-2 rounded-md text-white ${
                    generatingId === item._id
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {generatingId === item._id ? "Generating..." : "Generate Summary"}
                </button>
              </div>

              <details className="mt-4 bg-gray-50 p-3 rounded-md border border-gray-100 cursor-pointer">
                <summary className="font-medium text-gray-700 mb-1">
                  🔊 View Full Transcript
                </summary>
                <p className="text-gray-700 mt-2">{item.transcript}</p>
              </details>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SummariesPage;

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { FileText, Sparkles, ChevronDown } from 'lucide-react';

const GROQ_API = import.meta.env.VITE_GROQ_API;

const sendSummary = async (conversation) => {
  if (!conversation?.trim()) return 'No conversation provided.';
  try {
    const prompt = `Doctor-Patient Conversation:\n${conversation}\n\nPlease provide a concise summary highlighting:\n- The main topic discussed\n- Key symptoms, advice, or observations\n- Any next steps mentioned by the doctor\n\nKeep the summary professional, clear, and under 5 sentences.`;
    const response = await axios.post(`${GROQ_API}/generate`, { prompt }, { headers: { 'Content-Type': 'application/json' } });
    return response.data?.text || 'No summary returned.';
  } catch (error) {
    console.error('Error generating summary:', error);
    return 'Failed to generate summary.';
  }
};

function DoctorSummaries() {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const { user } = useSelector((state) => state.auth);
  const doctorId = user?._id;
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}/api/summary/${doctorId}`);
        setSummaries(res.data);
      } catch (err) {
        console.error('Error fetching summaries:', err);
      } finally {
        setLoading(false);
      }
    };
    if (doctorId) fetchSummaries();
  }, [doctorId]);

  const handleGenerateSummary = async (summaryId, transcript) => {
    setGeneratingId(summaryId);
    try {
      const aiSummary = await sendSummary(transcript);
      await axios.put(`${API}/api/summary/${summaryId}`, { summary: aiSummary });
      setSummaries((prev) =>
        prev.map((item) => (item._id === summaryId ? { ...item, summary: aiSummary } : item))
      );
    } catch (err) {
      console.error('Error generating summary:', err);
    } finally {
      setGeneratingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading summaries...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="doctor-summaries-page">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <FileText className="text-cyan-400" size={28} />
          Consultation Summaries
        </h1>
        <p className="text-slate-400 mt-2">Review and generate AI summaries of your consultations</p>
      </div>

      {summaries.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <FileText className="text-slate-600 mx-auto mb-4" size={48} />
          <h3 className="text-xl font-semibold text-white mb-2">No Summaries Yet</h3>
          <p className="text-slate-400">Summaries will appear after consultations.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {summaries.map((item) => (
            <div key={item._id} className="glass rounded-2xl p-6 animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center text-white font-bold text-sm">
                    {item.patient?.name?.charAt(0)?.toUpperCase() || 'P'}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">
                      Patient: <span className="text-cyan-400">{item.patient?.name || 'Unknown'}</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Summary</h4>
                <div className="glass-light rounded-xl p-4">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {item.summary || 'No summary generated yet.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleGenerateSummary(item._id, item.transcript)}
                  disabled={generatingId === item._id}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    generatingId === item._id
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      : 'gradient-primary text-white hover:shadow-lg hover:shadow-cyan-500/25'
                  }`}
                >
                  <Sparkles size={14} />
                  {generatingId === item._id ? 'Generating...' : 'Generate Summary'}
                </button>

                <button
                  onClick={() => setExpandedId(expandedId === item._id ? null : item._id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  <ChevronDown size={14} className={`transition-transform ${expandedId === item._id ? 'rotate-180' : ''}`} />
                  Transcript
                </button>
              </div>

              {expandedId === item._id && (
                <div className="mt-4 glass-light rounded-xl p-4">
                  <p className="text-sm text-slate-400 leading-relaxed">{item.transcript}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DoctorSummaries;

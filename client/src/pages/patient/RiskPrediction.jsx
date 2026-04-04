import { useState } from 'react';
import axios from 'axios';
import { Activity, Heart, Droplet, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

function RiskPrediction() {
  const [form, setForm] = useState({
    Age: '', Height: '', Weight: '', BP: '', BloodSugar: '', Hemoglobin: '', HeartRate: '',
    Nausea: false, Vomiting: false, BlurredVision: false, Headache: false,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (key, value) => setForm({ ...form, [key]: value });
  const handleToggle = (key) => setForm({ ...form, [key]: !form[key] });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const payload = {
        ...form,
        Age: parseInt(form.Age), Height: parseInt(form.Height), Weight: parseInt(form.Weight),
        BP: parseInt(form.BP), BloodSugar: parseInt(form.BloodSugar),
        Hemoglobin: parseFloat(form.Hemoglobin), HeartRate: parseInt(form.HeartRate),
        Nausea: form.Nausea ? 1 : 0, Vomiting: form.Vomiting ? 1 : 0,
        BlurredVision: form.BlurredVision ? 1 : 0, Headache: form.Headache ? 1 : 0,
      };
      const res = await axios.post('http://localhost:5000/predict', payload);
      setResult(res.data.prediction);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to get prediction');
    } finally {
      setLoading(false);
    }
  };

  const inputFields = [
    { key: 'Age', label: 'Age', icon: Activity, unit: 'years', placeholder: '25' },
    { key: 'Height', label: 'Height', icon: TrendingUp, unit: 'cm', placeholder: '165' },
    { key: 'Weight', label: 'Weight', icon: Activity, unit: 'kg', placeholder: '65' },
    { key: 'BP', label: 'Blood Pressure', icon: Heart, unit: 'mmHg', placeholder: '120' },
    { key: 'BloodSugar', label: 'Blood Sugar', icon: Droplet, unit: 'mg/dL', placeholder: '90' },
    { key: 'Hemoglobin', label: 'Hemoglobin', icon: Droplet, unit: 'g/dL', placeholder: '12.5' },
    { key: 'HeartRate', label: 'Heart Rate', icon: Heart, unit: 'bpm', placeholder: '75' },
  ];

  const symptoms = [
    { key: 'Nausea', label: 'Nausea', emoji: '🤢' },
    { key: 'Vomiting', label: 'Vomiting', emoji: '🤮' },
    { key: 'BlurredVision', label: 'Blurred Vision', emoji: '👁️' },
    { key: 'Headache', label: 'Headache', emoji: '🤕' },
  ];

  return (
    <div id="risk-prediction-page">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Activity className="text-cyan-400" size={28} />
          Risk Assessment
        </h1>
        <p className="text-slate-400 mt-2">Enter your health metrics for personalized risk analysis</p>
      </div>

      <div className="space-y-6">
        {/* Vital Signs */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Heart className="text-red-400" size={20} /> Vital Signs
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inputFields.map((field) => {
              const Icon = field.icon;
              return (
                <div key={field.key}>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{field.label}</label>
                  <div className="relative">
                    <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="number"
                      step={field.key === 'Hemoglobin' ? '0.1' : '1'}
                      value={form[field.key]}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full pl-9 pr-14 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none text-sm"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium">{field.unit}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Symptoms */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="text-amber-400" size={20} /> Current Symptoms
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {symptoms.map((s) => (
              <label
                key={s.key}
                className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  form[s.key]
                    ? 'border-cyan-500/50 bg-cyan-500/10 shadow-lg shadow-cyan-500/10'
                    : 'border-white/10 bg-white/3 hover:border-white/20'
                }`}
              >
                <input type="checkbox" checked={form[s.key]} onChange={() => handleToggle(s.key)} className="sr-only" />
                <span className="text-2xl mb-2">{s.emoji}</span>
                <span className={`text-xs font-semibold ${form[s.key] ? 'text-cyan-400' : 'text-slate-400'}`}>{s.label}</span>
                {form[s.key] && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="text-cyan-400" size={16} />
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 gradient-accent text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
        >
          {loading ? (
            <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing...</>
          ) : (
            <><Activity size={18} /> Predict Risk Level</>
          )}
        </button>

        {/* Result */}
        {result && (
          <div className="glass rounded-2xl p-6 border border-cyan-500/20 animate-slide-up">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center">
                <Activity className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Prediction Result</h3>
                <p className="text-2xl font-bold text-gradient mt-1">{result}</p>
                <p className="text-sm text-slate-400 mt-1">Consult your healthcare provider for detailed evaluation.</p>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="glass rounded-2xl p-6 border border-red-500/20 animate-slide-up">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-red-400" size={20} />
              <p className="text-red-400 text-sm">{error}</p>
              <button onClick={() => setError(null)} className="ml-auto text-xs text-red-400 hover:text-red-300">Dismiss</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RiskPrediction;

import React, { useState } from 'react';
import axios from 'axios';
import { Activity, Heart, Droplet, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

function RiskPredictionForm() {
  const [form, setForm] = useState({
    Age: '',
    Height: '',
    Weight: '',
    BP: '',
    BloodSugar: '',
    Hemoglobin: '',
    HeartRate: '',
    Nausea: false,
    Vomiting: false,
    BlurredVision: false,
    Headache: false,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleToggle = (key) => {
    setForm({ ...form, [key]: !form[key] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const payload = {
        ...form,
        Age: parseInt(form.Age),
        Height: parseInt(form.Height),
        Weight: parseInt(form.Weight),
        BP: parseInt(form.BP),
        BloodSugar: parseInt(form.BloodSugar),
        Hemoglobin: parseFloat(form.Hemoglobin),
        HeartRate: parseInt(form.HeartRate),
        Nausea: form.Nausea ? 1 : 0,
        Vomiting: form.Vomiting ? 1 : 0,
        BlurredVision: form.BlurredVision ? 1 : 0,
        Headache: form.Headache ? 1 : 0,
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
    <div className="min-h-full bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl">
              <Activity className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Pregnancy Risk Assessment
              </h2>
              <p className="text-gray-600 mt-1">Enter your health metrics for personalized risk analysis</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Vital Signs Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Heart className="text-red-500" size={24} />
              Vital Signs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inputFields.map((field) => {
                const Icon = field.icon;
                return (
                  <div key={field.key} className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {field.label}
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Icon size={18} />
                      </div>
                      <input
                        type="number"
                        step={field.key === 'Hemoglobin' ? '0.1' : '1'}
                        value={form[field.key]}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full border-2 border-gray-200 pl-10 pr-16 py-3 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                        required
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                        {field.unit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Symptoms Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <AlertCircle className="text-orange-500" size={24} />
              Current Symptoms
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {symptoms.map((symptom) => (
                <label
                  key={symptom.key}
                  className={`
                    relative flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all
                    ${form[symptom.key] 
                      ? 'border-purple-500 bg-purple-50 shadow-md' 
                      : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={form[symptom.key]}
                    onChange={() => handleToggle(symptom.key)}
                    className="sr-only"
                  />
                  <span className="text-3xl mb-2">{symptom.emoji}</span>
                  <span className={`text-sm font-semibold text-center ${form[symptom.key] ? 'text-purple-700' : 'text-gray-700'}`}>
                    {symptom.label}
                  </span>
                  {form[symptom.key] && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="text-purple-500" size={20} />
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-xl hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Activity size={20} />
                Predict Risk Level
              </>
            )}
          </button>
        </div>

        {/* Result Display */}
        {result && (
          <div className="mt-6 rounded-2xl shadow-lg p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200" style={{animation: 'fadeIn 0.4s ease-out'}}>
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                <Activity className="text-white" size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  Prediction Result
                </h3>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mt-2">
                  {result}
                </p>
                <p className="text-gray-600 mt-2">
                  Please consult with your healthcare provider for detailed evaluation and guidance.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-6 rounded-2xl shadow-lg p-6 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200" style={{animation: 'fadeIn 0.4s ease-out'}}>
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-full bg-red-500">
                <AlertCircle className="text-white" size={32} />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-800">Error</h3>
                <p className="text-gray-600 mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-700 font-semibold px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="bg-blue-500 p-2 rounded-lg mt-1">
              <AlertCircle className="text-white" size={20} />
            </div>
            <div>
              <h4 className="font-bold text-blue-900 mb-1">Important Note</h4>
              <p className="text-blue-800 text-sm">
                This prediction tool is for informational purposes only and should not replace professional medical advice. 
                Always consult with your healthcare provider for proper diagnosis and treatment.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default RiskPredictionForm;
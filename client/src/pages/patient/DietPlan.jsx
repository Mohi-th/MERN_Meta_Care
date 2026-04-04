import { UtensilsCrossed, Clock, CheckCircle, Bell, Info } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { messaging, getToken, onMessage } from '@/firebase';

const PREGNANCY_DIET_PLANS = [
  { meal: 'Breakfast', time: '08:00 AM', items: ['Oats porridge', '2 boiled eggs', 'Milk'], emoji: '🌅' },
  { meal: 'Mid-Morning Snack', time: '10:30 AM', items: ['Fruit', 'Roasted seeds'], emoji: '🍎' },
  { meal: 'Lunch', time: '12:30 PM', items: ['Chapati/Rice', 'Dal', 'Veggies', 'Yogurt'], emoji: '🍛' },
  { meal: 'Evening Snack', time: '04:00 PM', items: ['Sprouts salad', 'Herbal tea'], emoji: '🥗' },
  { meal: 'Dinner', time: '07:00 PM', items: ['Chapati/Rice', 'Grilled paneer/fish', 'Veggies'], emoji: '🍽️' },
  { meal: 'Before Bed', time: '09:00 PM', items: ['Warm milk', 'Almonds'], emoji: '🌙' },
];

function DietPlan() {
  const API = import.meta.env.VITE_API_URL;
  const [fcmToken, setFcmToken] = useState('');

  useEffect(() => {
    Notification.requestPermission().then(async (permission) => {
      if (permission === 'granted') {
        try {
          const currentToken = await getToken(messaging, {
            vapidKey: 'BLdjc9Ioj5VXA82wIUAMrBPQ_ffDTO1SIYl0_UKRFPO9vqeNTzBN2lccvT_7BUpBkl01LVnrHvgwcGkhdH253II',
          });
          setFcmToken(currentToken);
        } catch (err) {
          console.error('Error getting FCM token:', err);
        }
      }
    });

    onMessage(messaging, (payload) => {
      toast.info(payload.notification.body);
    });
  }, []);

  const handleSchedule = async () => {
    if (!fcmToken) {
      toast.error('Notification token not generated yet!');
      return;
    }
    try {
      await axios.post(`${API}/schedule-diet`, { token: fcmToken });
      toast.success('Diet notifications scheduled!');
    } catch (err) {
      toast.error('Failed to schedule notifications');
    }
  };

  return (
    <div id="diet-plan-page">
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <UtensilsCrossed className="text-cyan-400" size={28} />
            Pregnancy Diet Plan
          </h1>
          <p className="text-slate-400 mt-2">Nutritious meals for a healthy pregnancy journey</p>
        </div>
        <button
          onClick={handleSchedule}
          className="flex items-center gap-2 px-5 py-2.5 gradient-success text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
          id="schedule-diet-btn"
        >
          <Bell size={16} />
          Schedule Notifications
        </button>
      </div>

      {/* Diet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {PREGNANCY_DIET_PLANS.map((plan, idx) => (
          <div
            key={idx}
            className="glass rounded-2xl overflow-hidden hover:border-white/10 transition-all hover:shadow-lg hover:shadow-cyan-500/5 animate-slide-up"
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            <div className="p-5 border-b border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-4xl">{plan.emoji}</span>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Clock size={12} />
                  {plan.time}
                </div>
              </div>
              <h2 className="text-xl font-bold text-white">{plan.meal}</h2>
            </div>
            <div className="p-5 space-y-2">
              {plan.items.map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 glass-light px-3 py-2.5 rounded-lg">
                  <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                  <span className="text-sm text-slate-300 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Tip */}
      <div className="mt-8 glass rounded-2xl p-5 border border-cyan-500/10">
        <div className="flex items-start gap-3">
          <Info className="text-cyan-400 flex-shrink-0 mt-0.5" size={18} />
          <div>
            <h3 className="font-bold text-white text-sm mb-1">Nutrition Tip</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Stay hydrated throughout the day and listen to your body's hunger cues.
              Consult with your healthcare provider for personalized dietary recommendations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DietPlan;

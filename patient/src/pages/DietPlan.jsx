import React from "react";
import { Clock, Bell, CheckCircle } from 'lucide-react';

const PREGNANCY_DIET_PLANS = [
  { 
    meal: "Breakfast", 
    time: "08:00 AM", 
    items: ["Oats porridge", "2 boiled eggs", "Milk"],
    emoji: "🌅",
    bgGradient: "from-yellow-50 to-orange-50",
    borderColor: "border-orange-200"
  },
  { 
    meal: "Mid-Morning Snack", 
    time: "10:30 AM", 
    items: ["Fruit", "Roasted seeds"],
    emoji: "🍎",
    bgGradient: "from-green-50 to-emerald-50",
    borderColor: "border-emerald-200"
  },
  { 
    meal: "Lunch", 
    time: "12:30 PM", 
    items: ["Chapati/Rice", "Dal", "Veggies", "Yogurt"],
    emoji: "🍛",
    bgGradient: "from-amber-50 to-yellow-50",
    borderColor: "border-amber-200"
  },
  { 
    meal: "Evening Snack", 
    time: "04:00 PM", 
    items: ["Sprouts salad", "Herbal tea"],
    emoji: "🥗",
    bgGradient: "from-lime-50 to-green-50",
    borderColor: "border-lime-200"
  },
  { 
    meal: "Dinner", 
    time: "07:00 PM", 
    items: ["Chapati/Rice", "Grilled paneer/fish", "Veggies"],
    emoji: "🍽️",
    bgGradient: "from-blue-50 to-indigo-50",
    borderColor: "border-blue-200"
  },
  { 
    meal: "Before Bed", 
    time: "09:00 PM", 
    items: ["Warm milk", "Almonds"],
    emoji: "🌙",
    bgGradient: "from-purple-50 to-pink-50",
    borderColor: "border-purple-200"
  },
];

const DietPlan = ({fcmToken, scheduleDiet}) => {

  const handleSchedule = async () => {
    if (!fcmToken) {
      alert("Token not generated yet!");
      return;
    }
    
    if (scheduleDiet) {
      await scheduleDiet();
    }
    alert("Diet notifications scheduled for today!");
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Pregnancy Diet Plan
              </h1>
              <p className="text-gray-600">Nutritious meals designed for a healthy pregnancy journey</p>
            </div>
            <button
              onClick={handleSchedule}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              <Bell size={20} />
              Schedule Notifications
            </button>
          </div>
        </div>

        {/* Diet Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PREGNANCY_DIET_PLANS.map((plan, idx) => (
            <div 
              key={idx} 
              className={`bg-gradient-to-br ${plan.bgGradient} border-2 ${plan.borderColor} rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden`}
            >
              {/* Card Header */}
              <div className="bg-white bg-opacity-80 backdrop-blur-sm p-5 border-b-2 border-opacity-30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-5xl">{plan.emoji}</span>
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm">
                    <Clock size={16} className="text-gray-600" />
                    <span className="text-sm font-semibold text-gray-700">{plan.time}</span>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">{plan.meal}</h2>
              </div>

              {/* Card Body */}
              <div className="p-5">
                <div className="space-y-3">
                  {plan.items.map((item, i) => (
                    <div 
                      key={i} 
                      className="flex items-start gap-3 bg-white bg-opacity-60 backdrop-blur-sm p-3 rounded-lg hover:bg-opacity-80 transition-all"
                    >
                      <CheckCircle size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-800 font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <span className="text-2xl">💡</span>
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-800 mb-1">Nutrition Tip</h3>
              <p className="text-gray-600">
                Stay hydrated throughout the day and listen to your body's hunger cues. 
                Consult with your healthcare provider for personalized dietary recommendations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DietPlan;
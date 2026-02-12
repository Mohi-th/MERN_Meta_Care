import React, { useState } from 'react'
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../store/AuthSlice';
import { User, Phone, Lock, UserPlus, LogIn, Heart } from 'lucide-react';
import { toast } from "sonner"

const initialFormData = {
  name: "",
  phone: "",
  password: ""
}

function RegisterPage() {
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    dispatch(registerUser(formData)).then((data) => {
      setLoading(false);
      console.log(data?.payload,"message");
      if (data?.payload?.success) {
        toast.success("Account created successfully ", {
          description: "You can now log in to MetaCare",
        });
        navigate("/auth/login");
      }else{
        toast.error("Registration failed", {
        description: data?.payload?.message 
        });
        setFormData(initialFormData)
      }
    }).catch(() => {
      setLoading(false);
    });
  };

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 overflow-hidden">
      <div className="max-w-5xl w-full  grid md:grid-cols-2 gap-0 shadow-2xl rounded-3xl overflow-hidden">
        {/* Left Side - Branding */}
        <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-l-3xl p-12 flex flex-col justify-center items-center text-white hidden md:flex">
          <div className="bg-white bg-opacity-20 backdrop-blur-sm w-24 h-24 rounded-3xl flex items-center justify-center mb-6">
            <Heart className="text-white" size={56} />
          </div>
          <h1 className="text-5xl font-bold mb-4">Join MetaCare</h1>
          <p className="text-xl text-green-100 mb-8 text-center">Start your pregnancy wellness journey today</p>
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-lg">Connect with Expert Doctors</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-lg">Track Your Health Journey</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-lg">Get Personalized Care</span>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="bg-white rounded-r-3xl p-12 flex flex-col justify-center overflow-y-auto">
          {/* Mobile Logo */}
          <div className="md:hidden text-center mb-8">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Heart className="text-white" size={40} />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              MetaCare
            </h1>
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Create Account
          </h2>
          <p className="text-gray-600 mb-8">Join our pregnancy care community</p>

          <div className="space-y-5">
            {/* Name Input */}
            <div>
              <label htmlFor="register-username" className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  id="register-username"
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                  placeholder="Enter your full name"
                  value={formData?.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Phone Input */}
            <div>
              <label htmlFor="register-phone" className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Phone size={20} />
                </div>
                <input
                  type="tel"
                  id="register-phone"
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                  placeholder="Enter your phone number"
                  value={formData?.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="register-password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  id="register-password"
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                  placeholder="Create a secure password"
                  value={formData?.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Register Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  Create Account
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">Already have an account?</span>
              </div>
            </div>

            {/* Login Button */}
            <button
              onClick={() => navigate("/auth/login")}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all border-2 border-gray-200"
            >
              <LogIn size={20} />
              Sign In Instead
            </button>
          </div>

          {/* Footer Info */}
          <p className="mt-6 text-center text-sm text-gray-600">
            By registering, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
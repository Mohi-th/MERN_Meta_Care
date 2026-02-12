import React, { useState } from 'react'
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../store/AuthSlice';

const initialFormData = {
  name: '',
  phone: '',
  experience: '', // Added experience field
  hospital: '',   // Added hospital field
  password: '',
};

function RegisterPage() {
  const [formData, setFormData] = useState(initialFormData);

  const navigate = useNavigate()

  const dispatch = useDispatch()

  const handleSubmit = (e) => {
    console.log(formData)
    dispatch(registerUser(formData)).then((data) => {
      console.log(data)
    })
  };

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
        Register
      </h2>
      <div>
        <label htmlFor="register-username" className="block text-sm font-medium text-gray-700 mb-1">
          Username
        </label>
        <input
          type="text"
          id="register-username"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Choose a username"
          value={formData?.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <label htmlFor="register-phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number
        </label>
        <input
          type="tel" // Use type="tel" for phone numbers
          id="register-phone"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="e.g., +1234567890"
          value={formData?.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>
      <div>
        <label htmlFor="register-experience" className="block text-sm font-medium text-gray-700 mb-1">
          Experience (Years)
        </label>
        <input
          type="number" // Use type="number" for experience
          id="register-experience"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="e.g., 5"
          value={formData.experience}
          onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
        />
      </div>
      <div>
        <label htmlFor="register-hospital" className="block text-sm font-medium text-gray-700 mb-1">
          Hospital
        </label>
        <input
          type="text"
          id="register-hospital"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="e.g., City General Hospital"
          value={formData.hospital}
          onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
        />
      </div>
      <div>
        <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          id="register-password"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Create a password"
          value={formData?.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
      </div>
      <button
        onClick={handleSubmit}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200 ease-in-out"
      >
        Register
      </button>
      <div>
        <p>Already Have an Account?</p>
        <button
          onClick={() => {
            navigate("/auth/login")
          }}
          className="mt-6 w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 transition duration-200 ease-in-out"
        >
          Login
        </button>
      </div>
    </div>
  );
};


export default RegisterPage

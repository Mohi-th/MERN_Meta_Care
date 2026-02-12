import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../store/AuthSlice';

const initialFormData = {
  phone: "",
  password: "",
}

function LoginPage() {
  const [formData, setFormData] = useState(initialFormData);

  const { user } = useSelector(state => state.doctor)

  console.log(user, "userlll")

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleSubmit = (e) => {
    dispatch(loginUser(formData)).then((data) => {
      console.log(data)
      if (data?.payload?.success) {
        navigate("/home/appointments")
      }
    })
  };

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
        Login
      </h2>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number
        </label>
        <input
          type="tel" // Use type="tel" for phone numbers
          id="phone"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="e.g., +1234567890"
          value={formData?.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}

        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          id="password"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Enter your password"
          value={formData?.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}

        />
      </div>
      <button
        onClick={handleSubmit}
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 ease-in-out"
      >
        Log In
      </button>
      <div>
        <p>Don't Have an Account?</p>
        <button
          onClick={() => {
            navigate("/auth/register")
          }}
          className="mt-6 w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 transition duration-200 ease-in-out"
        >
          Create Account
        </button>
      </div>
    </div>
  );
}

export default LoginPage

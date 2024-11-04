'use client';

import { useState } from 'react';
import { auth } from '../components/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FaEye, FaEyeSlash } from 'react-icons/fa';  // Import FontAwesome icons

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);  // State to toggle password visibility
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Redirect to car details page after successful signup
      window.location.href = '/nonCarOwner/registration'; // Adjust route for the car owner details page
    } catch (error) {
      console.error('Error signing up', error);
      setError('Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-catalinaBlue px-4 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full space-y-6">
        <h2 className="text-2xl font-bold text-center text-catalinaBlue mb-6">User Registration</h2>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <div className="space-y-4">
          <div className="flex flex-col space-y-1">
            <label className="text-gray-500 text-sm">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="relative flex flex-col space-y-1">
            <label className="text-gray-500 text-sm">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}  // Toggle password visibility
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className={`bg-orange-600 w-full py-2 rounded-lg text-white font-semibold transition duration-300 ${loading ? 'bg-orange-400 cursor-not-allowed' : 'hover:bg-orange-700'}`}
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
}

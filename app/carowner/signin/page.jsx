'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '../../components/firebase';  // Adjust the import path according to your project structure
import { FaEye, FaEyeSlash } from 'react-icons/fa';  // Import FontAwesome icons

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);  // State to toggle password visibility
  const router = useRouter();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Set persistence to local
      await setPersistence(auth, browserLocalPersistence);

      // Sign in the user
      await signInWithEmailAndPassword(auth, email, password);
      
      setLoading(false);
      router.push('/carowner/dashboard'); // Redirect to dashboard after successful login
    } catch (error) {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-catalinaBlue px-4 sm:px-6 lg:px-8">
      <form 
        onSubmit={handleSignIn} 
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md space-y-6"
      >
        <h2 className="text-2xl font-bold text-catalinaBlue mb-6 text-center">
          Sign In As A Car Owner
        </h2>
        
        {error && <p className="text-red-500 text-center">{error}</p>}

        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
            required
          />

          <div className="relative w-full">
            <input
              type={showPassword ? 'text' : 'password'}  // Toggle input type
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
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
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}


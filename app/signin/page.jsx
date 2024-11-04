'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '../components/firebase';  // Adjust the import path according to your project structure

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
      router.push('/nonCarOwner/dashboard'); // Redirect to dashboard after successful login
    } catch (error) {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-catalinaBlue">
      <form onSubmit={handleSignIn} className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full space-y-4">
        <h2 className="text-2xl font-bold text-catalinaBlue mb-4">Sign In</h2>
        
        {error && <p className="text-red-500">{error}</p>}

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="input"
          required
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="input"
          required
        />

        <button
          type="submit"
          className="bg-orange-600 w-full py-2 rounded-lg text-white font-semibold"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { auth } from '../components/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Redirect to car details page after successful signup
      window.location.href = '/nonCarOwner/registration'; // Change this to the actual route for car owner details page
    } catch (error) {
      console.error('Error signing up', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-catalinaBlue">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full space-y-4">
        <h2 className="text-2xl font-bold mb-4">User Registration</h2>

        <div className="flex flex-col space-y-1">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="Enter your email"
          />
          <label className="text-gray-500 text-sm">Email</label>
        </div>

        <div className="flex flex-col space-y-1">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            placeholder="Enter your password"
          />
          <label className="text-gray-500 text-sm">Password</label>
        </div>

        <button type="submit" className="bg-orange-600 w-full py-2 rounded-lg text-white font-semibold">
          Register
        </button>
      </form>
    </div>
  );
}


// "react": "19.0.0-rc-02c0e824-20241028",
// "react-dom": "19.0.0-rc-02c0e824-20241028",

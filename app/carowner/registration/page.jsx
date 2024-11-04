'use client';

import { useState } from 'react';
import { auth, db } from '../../components/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function CarOwnerRegistration() {
  const [carType, setCarType] = useState('');
  const [yearsUsed, setYearsUsed] = useState(0);
  const [floorNo, setFloorNo] = useState('');
  const [department, setDepartment] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [reminderTime, setReminderTime] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = auth.currentUser; // Get the currently logged-in user
    if (user) {
      try {
        await setDoc(doc(db, 'carOwners', user.uid), {
          email: user.email,
          carType,
          yearsUsed,
          floorNo,
          department,
          departureTime,
          reminderTime,
        });

        // Redirect or show a success message
        window.location.href = '/carowner/dashboard'; // Change this to the appropriate page after registration
      } catch (error) {
        console.error('Error saving car owner details', error);
      }
    } else {
      console.error('User not authenticated');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-catalinaBlue">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full space-y-4">
        <h2 className="text-2xl font-bold mb-4">Car Owner Details Registration</h2>

        <div className="flex flex-col space-y-1">
          <input
            type="text"
            value={floorNo}
            onChange={(e) => setFloorNo(e.target.value)}
            className="input"
            placeholder="Enter your floor number"
          />
          <label className="text-gray-500 text-sm">Floor No</label>
        </div>

        <div className="flex flex-col space-y-1">
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="input"
            placeholder="Enter your department"
          />
          <label className="text-gray-500 text-sm">Department</label>
        </div>

        <div className="flex flex-col space-y-1">
          <input
            type="text"
            value={carType}
            onChange={(e) => setCarType(e.target.value)}
            className="input"
            placeholder="Enter your car type"
          />
          <label className="text-gray-500 text-sm">Car Type</label>
        </div>

        <div className="flex flex-col space-y-1">
          <input
            type="number"
            value={yearsUsed}
            onChange={(e) => setYearsUsed(e.target.value)}
            className="input"
            placeholder="Enter years used"
          />
          <label className="text-gray-500 text-sm">Years Used</label>
        </div>

        <div className="flex flex-col space-y-1">
          <input
            type="time"
            value={departureTime}
            onChange={(e) => setDepartureTime(e.target.value)}
            className="input"
          />
          <label className="text-gray-500 text-sm">Usual Departure Time (This can be changed later)</label>
        </div>

        <div className="flex flex-col space-y-1">
          <input
            type="time"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            className="input"
          />
          <label className="text-gray-500 text-sm">Reminder Time (This can be changed later)</label>
        </div>

        <button type="submit" className="bg-orange-600 w-full py-2 rounded-lg text-white font-semibold">
          Register Details
        </button>
      </form>
    </div>
  );
}

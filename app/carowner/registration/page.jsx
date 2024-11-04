'use client';

import { useState } from 'react';
import { auth, db } from '../../components/firebase';
import { doc, setDoc } from 'firebase/firestore';
import toast, { Toaster } from 'react-hot-toast';

export default function CarOwnerRegistration() {
  const [carType, setCarType] = useState('');
  const [yearsUsed, setYearsUsed] = useState('');
  const [floorNo, setFloorNo] = useState('');
  const [department, setDepartment] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    // Validate the fields
    if (!floorNo) newErrors.floorNo = 'Please enter your floor number';
    if (!department) newErrors.department = 'Please enter your department';
    if (!carType) newErrors.carType = 'Please enter your car type';
    if (!yearsUsed) newErrors.yearsUsed = 'Please enter years used';
    if (!departureTime) newErrors.departureTime = 'Please enter departure time';
    if (!reminderTime) newErrors.reminderTime = 'Please enter reminder time';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

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

        setLoading(false);
        toast.success('Successfully Registered!');
        // Redirect after a delay or directly
        setTimeout(() => {
          window.location.href = '/carowner/signin'; // Change this to the appropriate page after registration
        }, 1500);
      } catch (error) {
        setLoading(false);
        console.error('Error saving car owner details', error);
        toast.error('Registration failed. Please try again.');
      }
    } else {
      setLoading(false);
      console.error('User not authenticated');
      toast.error('User not authenticated');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-catalinaBlue px-4">
      <Toaster position="top-center" reverseOrder={false} />
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full space-y-6">
        <h2 className="text-3xl font-bold mb-4 text-center">Car Owner Registration</h2>

        <div className="flex flex-col">
          <label className="text-gray-700 font-semibold mb-1">Floor No</label>
          <input
            type="text"
            value={floorNo}
            onChange={(e) => {
              setFloorNo(e.target.value);
              setErrors({ ...errors, floorNo: '' });
            }}
            className={`border ${
              errors.floorNo ? 'border-red-500' : 'border-gray-300'
            } rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-600`}
            placeholder="Enter your floor number"
          />
          {errors.floorNo && <p className="text-red-500 text-sm">{errors.floorNo}</p>}
        </div>

        <div className="flex flex-col">
          <label className="text-gray-700 font-semibold mb-1">Department</label>
          <input
            type="text"
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setErrors({ ...errors, department: '' });
            }}
            className={`border ${
              errors.department ? 'border-red-500' : 'border-gray-300'
            } rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-600`}
            placeholder="Enter your department"
          />
          {errors.department && <p className="text-red-500 text-sm">{errors.department}</p>}
        </div>

        <div className="flex flex-col">
          <label className="text-gray-700 font-semibold mb-1">Car Type</label>
          <input
            type="text"
            value={carType}
            onChange={(e) => {
              setCarType(e.target.value);
              setErrors({ ...errors, carType: '' });
            }}
            className={`border ${
              errors.carType ? 'border-red-500' : 'border-gray-300'
            } rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-600`}
            placeholder="Enter your car type"
          />
          {errors.carType && <p className="text-red-500 text-sm">{errors.carType}</p>}
        </div>

        <div className="flex flex-col">
          <label className="text-gray-700 font-semibold mb-1">Years Used</label>
          <input
            type="number"
            value={yearsUsed}
            onChange={(e) => {
              setYearsUsed(e.target.value);
              setErrors({ ...errors, yearsUsed: '' });
            }}
            className={`border ${
              errors.yearsUsed ? 'border-red-500' : 'border-gray-300'
            } rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-600`}
            placeholder="Enter years used"
          />
          {errors.yearsUsed && <p className="text-red-500 text-sm">{errors.yearsUsed}</p>}
        </div>

        <div className="flex flex-col">
          <label className="text-gray-700 font-semibold mb-1">Departure Time</label>
          <input
            type="time"
            value={departureTime}
            onChange={(e) => {
              setDepartureTime(e.target.value);
              setErrors({ ...errors, departureTime: '' });
            }}
            className={`border ${
              errors.departureTime ? 'border-red-500' : 'border-gray-300'
            } rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-600`}
          />
          {errors.departureTime && <p className="text-red-500 text-sm">{errors.departureTime}</p>}
        </div>

        <div className="flex flex-col">
          <label className="text-gray-700 font-semibold mb-1">Reminder Time</label>
          <input
            type="time"
            value={reminderTime}
            onChange={(e) => {
              setReminderTime(e.target.value);
              setErrors({ ...errors, reminderTime: '' });
            }}
            className={`border ${
              errors.reminderTime ? 'border-red-500' : 'border-gray-300'
            } rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-600`}
          />
          {errors.reminderTime && <p className="text-red-500 text-sm">{errors.reminderTime}</p>}
        </div>

        <button
          type="submit"
          className={`w-full py-2 rounded-lg text-white font-semibold transition duration-300 ${
            loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'
          }`}
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register Details'}
        </button>
      </form>
    </div>
  );
}

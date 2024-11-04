// app/components/CarpoolForm.js

import React, { useState } from 'react';

const CarpoolForm = ({ onSubmit }) => {
  const [destination, setDestination] = useState('');
  const [seats, setSeats] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ destination, seats });
    setDestination('');
    setSeats(1);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <input
        type="text"
        placeholder="Destination"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        className="border rounded p-2 mr-2"
        required
      />
      <input
        type="number"
        min="1"
        value={seats}
        onChange={(e) => setSeats(e.target.value)}
        className="border rounded p-2 mr-2"
        required
      />
      <button type="submit" className="bg-blue-500 text-white rounded p-2">
        Offer Ride
      </button>
    </form>
  );
};

export default CarpoolForm;

'use client';

import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { getDoc, doc } from 'firebase/firestore';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';

export default function Dashboard() {
  const [carOwnerData, setCarOwnerData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, 'carOwners', 'USER_ID'); // Replace with dynamic ID
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setCarOwnerData(docSnap.data());
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [0, 0], // Set this to your initial coordinates
      zoom: 10,
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      {carOwnerData && (
        <>
          <div className="bg-catalinaBlue text-white p-4 w-full flex justify-between items-center">
            <h2 className="text-xl">{carOwnerData.carType}</h2>
            <p>Seats Available: X</p> {/* Dynamically fetch */}
          </div>

          <div id="map" className="w-full h-96 my-4"></div>

          <div className="w-full p-4 bg-white space-y-4">
            {/* Dynamically render passengers here */}
            <p>Passenger Info 1: Floor, Unit, Dropoff</p>
            <p>Passenger Info 2: Floor, Unit, Dropoff</p>
          </div>
        </>
      )}
    </div>
  );
}

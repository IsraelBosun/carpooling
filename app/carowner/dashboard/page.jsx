'use client';

import { useState, useEffect, useRef } from 'react';
import { auth, db } from '../../components/firebase'; // Ensure auth is imported
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css'; // Make sure to import the CSS

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function Dashboard() {
  const [carOwnerData, setCarOwnerData] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const mapContainerRef = useRef(null); // Use a ref for the map container
  const mapRef = useRef(null); // Ref for the map instance
  const markerRef = useRef(null);

  useEffect(() => {
    const fetchData = async (userId) => {
      const docRef = doc(db, 'carOwners', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setCarOwnerData(docSnap.data());
      } else {
        console.error("No such document!");
      }
    };

    // Check if the user is authenticated
    const user = auth.currentUser;
    if (user) {
      fetchData(user.uid); // Pass user ID to fetchData
    } else {
      console.error("User not authenticated");
    }
  }, []); // Only run on mount

  // Function to update location in Firestore
  const updateLocationInFirestore = async (userId, location) => {
    try {
      const docRef = doc(db, 'carOwners', userId);
      await updateDoc(docRef, { location }); // Update the location field in Firestore
    } catch (error) {
      console.error("Error updating location in Firestore: ", error);
    }
  };

  useEffect(() => {
    // Watch the user's location in real-time
    const watchLocation = () => {
      if (navigator.geolocation) {
        const user = auth.currentUser; // Get the current authenticated user
        if (!user) {
          console.error("User not authenticated");
          return;
        }

        // Track the location and update Firestore in real-time
        navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const location = { latitude, longitude };

            setCurrentLocation([longitude, latitude]); // Update state with coordinates

            // Update the location in Firestore for the authenticated user
            updateLocationInFirestore(user.uid, location);
          },
          (error) => {
            console.error("Error getting location: ", error);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          }
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
      }
    };

    watchLocation();
  }, []); // Only run on mount

  useEffect(() => {
    if (mapContainerRef.current && currentLocation) {
      if (!mapRef.current) {
        mapRef.current = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: 'mapbox://styles/mapbox/streets-v11',
          center: currentLocation,
          zoom: 14,
        });
      } else {
        mapRef.current.setCenter(currentLocation);
      }

      // Remove existing marker if any
      if (markerRef.current) {
        markerRef.current.remove();
      }

      // Create a new marker
      markerRef.current = new mapboxgl.Marker()
        .setLngLat(currentLocation)
        .addTo(mapRef.current);

      // Add a popup for the marker
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setText('You are here!')
        .setLngLat(currentLocation);

      markerRef.current.setPopup(popup);

      // Ensure the map resizes properly with container
      mapRef.current.resize();
    }
  }, [currentLocation]);

  return (
    <div className="w-full h-screen">
      <section className="mt-2">
        <div className="main">
          <div className="gradient" />
        </div>
        <div className="app">
          <h1 className="head_text text-center">
            Prototype For Project {" "}
            <br className="max-md:hidden" />
            <span className="orange_gradient text-center">GreenWheel</span>
          </h1>
        </div>

        {carOwnerData && (
          <>
            <div className="bg-blue-600 z-10 text-white p-4 flex justify-between items-center">
              <h2 className="text-xl text-black">{carOwnerData.carType}</h2>
              <p className='text-black'>Seats Available: X</p> {/* Dynamically fetch */}
            </div>
            <div className="w-full p-4 bg-white space-y-4">
              {/* Dynamically render passengers here */}
              <p>Passenger Info 1: Floor, Unit, Dropoff</p>
              <p>Passenger Info 2: Floor, Unit, Dropoff</p>
            </div>
          </>
        )}

        <div className="flex justify-center mt-6 items-center h-screen">
          {/* Mapbox map container */}
          <div
            ref={mapContainerRef}
            className="w-[95%] items-center h-[80%] rounded-2xl shadow-md"
            style={{ height: '80vh' }}
          />
        </div>
      </section>
    </div>
  );
}

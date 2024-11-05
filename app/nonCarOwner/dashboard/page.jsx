// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { auth, db } from '../../components/firebase'; // Ensure auth is imported
// import { getDoc, doc, updateDoc, collection, getDocs } from 'firebase/firestore';
// import mapboxgl from 'mapbox-gl';
// import 'mapbox-gl/dist/mapbox-gl.css'; // Make sure to import the CSS

// mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// export default function Dashboard() {
//   const [carOwnerData, setCarOwnerData] = useState(null);
//   const [otherCarOwners, setOtherCarOwners] = useState([]); // State to hold other car owners
//   const [currentLocation, setCurrentLocation] = useState(null);
//   const mapContainerRef = useRef(null); // Use a ref for the map container
//   const mapRef = useRef(null); // Ref for the map instance
//   const markerRef = useRef(null);

//   useEffect(() => {
//     const fetchData = async (userId) => {
//       const docRef = doc(db, 'nonCarOwners', userId);
//       const docSnap = await getDoc(docRef);

//       if (docSnap.exists()) {
//         setCarOwnerData(docSnap.data());
//       } else {
//         console.error("No such document!");
//       }
//     };

//     const fetchOtherCarOwners = async () => {
//       const carOwnersRef = collection(db, 'carOwners'); // Adjust the collection name if different
//       const querySnapshot = await getDocs(carOwnersRef);
//       const ownersData = [];
//       querySnapshot.forEach((doc) => {
//         if (doc.data().movement) { // Assuming movement is an array of coordinates
//           ownersData.push({ id: doc.id, coordinates: doc.data().movement });
//         }
//       });
//       setOtherCarOwners(ownersData); // Set the other car owners' locations
//     };

//     // Check if the user is authenticated
//     const user = auth.currentUser;
//     if (user) {
//       fetchData(user.uid); // Pass user ID to fetchData
//       fetchOtherCarOwners(); // Fetch other car owners' data
//     } else {
//       console.error("User not authenticated");
//     }
//   }, []); // Only run on mount

//   // Function to update location in Firestore
//   const updateLocationInFirestore = async (userId, location) => {
//     try {
//       const docRef = doc(db, 'nonCarOwners', userId);
//       await updateDoc(docRef, { location }); // Update the location field in Firestore
//     } catch (error) {
//       console.error("Error updating location in Firestore: ", error);
//     }
//   };

//   useEffect(() => {
//     // Get the user's location initially
//     const initializeLocation = () => {
//       if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition(
//           (position) => {
//             const { latitude, longitude } = position.coords;
//             const initialLocation = [longitude, latitude];

//             setCurrentLocation(initialLocation); // Set the initial location

//             const user = auth.currentUser; // Get the current authenticated user
//             if (user) {
//               // Update Firestore with the initial location
//               updateLocationInFirestore(user.uid, { latitude, longitude });
//             }
//           },
//           (error) => {
//             console.error("Error getting initial location: ", error);
//           },
//           {
//             enableHighAccuracy: true,
//             timeout: 5000,
//             maximumAge: 0,
//           }
//         );
//       } else {
//         console.error("Geolocation is not supported by this browser.");
//       }
//     };

//     const watchLocation = () => {
//       if (navigator.geolocation) {
//         const user = auth.currentUser; // Get the current authenticated user
//         if (!user) {
//           console.error("User not authenticated");
//           return;
//         }

//         // Track the location and update Firestore in real-time
//         navigator.geolocation.watchPosition(
//           (position) => {
//             const { latitude, longitude } = position.coords;
//             const location = { latitude, longitude };

//             setCurrentLocation([longitude, latitude]); // Update state with coordinates

//             // Update the location in Firestore for the authenticated user
//             updateLocationInFirestore(user.uid, location);
//           },
//           (error) => {
//             console.error("Error getting location: ", error);
//           },
//           {
//             enableHighAccuracy: true,
//             timeout: 5000,
//             maximumAge: 0,
//           }
//         );
//       } else {
//         console.error("Geolocation is not supported by this browser.");
//       }
//     };

//     // Initialize the user's location first
//     initializeLocation();
//     // After initializing, start watching for updates
//     watchLocation();
//   }, []); // Only run on mount

//   useEffect(() => {
//     if (mapContainerRef.current && currentLocation) {
//       if (!mapRef.current) {
//         mapRef.current = new mapboxgl.Map({
//           container: mapContainerRef.current,
//           style: 'mapbox://styles/mapbox/streets-v11',
//           center: currentLocation,
//           zoom: 14,
//         });
  
//         mapRef.current.on('load', () => {
//           // Add a source for the polylines
//           mapRef.current.addSource('carOwnersMovement', {
//             type: 'geojson',
//             data: {
//               type: 'FeatureCollection',
//               features: [], // Initialize with empty features
//             },
//           });
  
//           // Now you can add your initial polyline or update the source data
//           // For example, if you have existing coordinates to display:
//           const features = otherCarOwners.map(owner => ({
//             type: 'Feature',
//             geometry: {
//               type: 'LineString',
//               coordinates: owner.coordinates.map(coord => [coord.longitude, coord.latitude]),
//             },
//           }));
  
//           // Update the source with new features
//           mapRef.current.getSource('carOwnersMovement').setData({
//             type: 'FeatureCollection',
//             features: features,
//           });
  
//           // Add the polyline layer after adding the source
//           mapRef.current.addLayer({
//             id: 'carOwnersMovementLayer',
//             type: 'line',
//             source: 'carOwnersMovement',
//             layout: {
//               'line-join': 'round',
//               'line-cap': 'round',
//             },
//             paint: {
//               'line-color': '#888',
//               'line-width': 4,
//             },
//           });
//         });
//       } else {
//         mapRef.current.setCenter(currentLocation);
//       }
//       // Remove existing marker if any
//       if (markerRef.current) {
//         markerRef.current.remove();
//       }

//       // Create a new marker for the current user
//       markerRef.current = new mapboxgl.Marker({ color: 'blue' }) // Set color for current user
//         .setLngLat(currentLocation)
//         .addTo(mapRef.current);

//       // Add a popup for the marker
//       const popup = new mapboxgl.Popup({ offset: 25 })
//         .setText('You are here!')
//         .setLngLat(currentLocation);

//       markerRef.current.setPopup(popup);

//       // Prepare features for car owners' movements
//       const features = otherCarOwners.map(owner => ({
//         type: 'Feature',
//         geometry: {
//           type: 'LineString',
//           coordinates: owner.coordinates.map(coord => [coord.longitude, coord.latitude]),
//         },
//       }));

//       // Update the source data with the new features
//       mapRef.current.getSource('carOwnersMovement').setData({
//         type: 'FeatureCollection',
//         features: features,
//       });

//       // Ensure the map resizes properly with container
//       mapRef.current.resize();
//     }
//   }, [currentLocation, otherCarOwners]); // Trigger when these change

//   return (
//     <div className="w-full h-screen">
//       <section className="mt-2">
//         <div className="main">
//           <div className="gradient" />
//         </div>
//         <div className="app">
//           <h1 className="head_text text-center">
//             Prototype For Project {" "}
//             <br className="max-md:hidden" />
//             <span className="orange_gradient text-center">GreenWheel</span>
//           </h1>
//         </div>

//         {carOwnerData && (
//           <>
//             <div className="bg-blue-600 z-10 text-white p-4 flex justify-between items-center">
//               <h2 className="text-xl text-black">{carOwnerData.email}</h2>
//               <p className='text-black'>Seats Available: X</p> {/* Dynamically fetch */}
//             </div>
//             <div className="w-full p-4 bg-white space-y-4">
//               {/* Dynamically render passengers here */}
//               <p>Passenger Info 1: Floor, Unit, Dropoff</p>
//               <p>Passenger Info 2: Floor, Unit, Dropoff</p>
//             </div>
//           </>
//         )}

//         <div className="flex justify-center mt-6 items-center h-screen">
//           {/* Mapbox map container */}se
//           <div
//             ref={mapContainerRef}
//             className="w-[95%] items-center h-[80%] rounded-2xl shadow-md"
//             style={{ height: '80vh' }}
//           />
//         </div>
//       </section>
//     </div>
//   );
// }










































'use client';

import { useState, useEffect, useRef } from 'react';
import { auth, db } from '../../components/firebase'; // Ensure auth is imported
import { getDoc, doc, updateDoc, collection, getDocs } from 'firebase/firestore';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css'; // Make sure to import the CSS

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function Dashboard() {
  const [carOwnerData, setCarOwnerData] = useState(null);
  const [otherCarOwners, setOtherCarOwners] = useState([]); // State to hold other car owners
  const [currentLocation, setCurrentLocation] = useState(null);
  const mapContainerRef = useRef(null); // Use a ref for the map container
  const mapRef = useRef(null); // Ref for the map instance
  const markerRef = useRef(null);

  useEffect(() => {
    const fetchData = async (userId) => {
      const docRef = doc(db, 'nonCarOwners', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setCarOwnerData(docSnap.data());
      } else {
        console.error("No such document!");
      }
    };

    const fetchOtherCarOwners = async () => {
      const carOwnersRef = collection(db, 'carOwners'); // Adjust the collection name if different
      const querySnapshot = await getDocs(carOwnersRef);
      const ownersData = [];
      querySnapshot.forEach((doc) => {
        if (doc.data().location) {
          ownersData.push(doc.data().location);
        }
      });
      setOtherCarOwners(ownersData); // Set the other car owners' locations
    };

    // Check if the user is authenticated
    const user = auth.currentUser;
    if (user) {
      fetchData(user.uid); // Pass user ID to fetchData
      fetchOtherCarOwners(); // Fetch other car owners' data
    } else {
      console.error("User not authenticated");
    }
  }, []); // Only run on mount

  // Function to update location in Firestore
  const updateLocationInFirestore = async (userId, location) => {
    try {
      const docRef = doc(db, 'nonCarOwners', userId);
      await updateDoc(docRef, { location }); // Update the location field in Firestore
    } catch (error) {
      console.error("Error updating location in Firestore: ", error);
    }
  };

  useEffect(() => {
    // Get the user's location initially
    const initializeLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const initialLocation = [longitude, latitude];

            setCurrentLocation(initialLocation); // Set the initial location

            const user = auth.currentUser; // Get the current authenticated user
            if (user) {
              // Update Firestore with the initial location
              updateLocationInFirestore(user.uid, { latitude, longitude });
            }
          },
          (error) => {
            console.error("Error getting initial location: ", error);
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

    // Initialize the user's location first
    initializeLocation();
    // After initializing, start watching for updates
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

      // Create a new marker for the current user
      markerRef.current = new mapboxgl.Marker({ color: 'blue' }) // Set color for current user
        .setLngLat(currentLocation)
        .addTo(mapRef.current);

      // Add a popup for the marker
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setText('You are here!')
        .setLngLat(currentLocation);

      markerRef.current.setPopup(popup);

      // Create markers for other car owners
      otherCarOwners.forEach(ownerLocation => {
        const ownerMarker = new mapboxgl.Marker({ color: 'red' }) // Set a different color for other car owners
          .setLngLat([ownerLocation.longitude, ownerLocation.latitude])
          .addTo(mapRef.current);
      });

      // Ensure the map resizes properly with container
      mapRef.current.resize();
    }
  }, [currentLocation, otherCarOwners]); // Trigger when these change

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
              <h2 className="text-xl text-black">{carOwnerData.email}</h2>
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

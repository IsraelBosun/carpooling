"use client"


import { useState, useEffect, useRef } from 'react';
import { auth, db } from '../../components/firebase';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { FaCarAlt, FaBirthdayCake } from "react-icons/fa";
import { FcDepartment } from "react-icons/fc";
import { MdEditLocationAlt } from "react-icons/md";





mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function Dashboard() {
  const [carOwnerData, setCarOwnerData] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [user, setUser] = useState(null); // Keep track of authenticated user
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderRef = useRef(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser); // Set the authenticated user
      } else {
        setUser(null); // Set user to null if not authenticated
        console.error('User not authenticated');
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      // Fetch car owner data when user is authenticated
      const fetchData = async (userId) => {
        const docRef = doc(db, 'carOwners', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setCarOwnerData(data);

          // Set destination if it exists
          if (data.destination) {
            setDestination(data.destination);
          }
        } else {
          console.error('No such document!');
        }
      };

      fetchData(user.uid); // Fetch car owner data using the user's UID
    }
  }, [user]); // Trigger the effect only when the user state changes

  // Update Firestore with new location and destination
  const updateLocationInFirestore = async (userId, location, destDetails) => {
    try {
      const docRef = doc(db, 'carOwners', userId);
      const updateData = {
        location,
        destination: destDetails || destination, // Preserve existing destination if no new one
      };
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating location in Firestore: ', error);
    }
  };

  useEffect(() => {
    const watchLocation = () => {
      if (navigator.geolocation) {
        if (!user) {
          console.error('User not authenticated');
          return;
        }

        navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const location = { latitude, longitude };

            setCurrentLocation([longitude, latitude]);

            updateLocationInFirestore(user.uid, location, destination);
          },
          (error) => {
            console.error('Error getting location: ', error);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          }
        );
      } else {
        console.error('Geolocation is not supported by this browser.');
      }
    };

    if (user) {
      watchLocation();
    }
  }, [user, destination]); // Watch location only if user is authenticated

  useEffect(() => {
    if (mapContainerRef.current && currentLocation) {
      if (!mapRef.current) {
        mapRef.current = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: 'mapbox://styles/mapbox/streets-v11',
          center: currentLocation,
          zoom: 14,
        });

        geocoderRef.current = new MapboxGeocoder({
          accessToken: mapboxgl.accessToken,
          mapboxgl: mapboxgl,
          marker: false,
          placeholder: 'Search for a location',
        });

        mapRef.current.addControl(geocoderRef.current);

        geocoderRef.current.on('result', (e) => {
          const { geometry, place_name } = e.result;
          const newDestinationCoordinates = [geometry.coordinates[0], geometry.coordinates[1]];

          const newDestination = {
            name: place_name,
            coordinates: {
              longitude: geometry.coordinates[0],
              latitude: geometry.coordinates[1],
            },
          };

          setDestination(newDestination);

          updateLocationInFirestore(user.uid, { latitude: currentLocation[1], longitude: currentLocation[0] }, newDestination);

          // Fetch the route after setting the destination
          fetchRoute(currentLocation, newDestinationCoordinates);
        });

      // } else {
      //   mapRef.current.setCenter(currentLocation);
      }

      if (markerRef.current) {
        markerRef.current.remove();
      }

      markerRef.current = new mapboxgl.Marker()
        .setLngLat(currentLocation)
        .addTo(mapRef.current);

      const popup = new mapboxgl.Popup({ offset: 25 })
        .setText('You are here!')
        .setLngLat(currentLocation);

      markerRef.current.setPopup(popup);
      mapRef.current.resize();
    }
  }, [currentLocation]);

  const fetchRoute = async (start, end) => {
    try {
      const response = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`);
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0].geometry.coordinates;

        // Create a GeoJSON source for the route
        if (mapRef.current.getSource('route')) {
          mapRef.current.getSource('route').setData({
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: route,
            },
          });
        } else {
          mapRef.current.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: route,
              },
            },
          });

          // Add a layer to visualize the route
          mapRef.current.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-cap': 'round',
              'line-join': 'round',
            },
            paint: {
              'line-color': '#FF0000', // Red color for the line
              'line-width': 4,
            },
          });
        }
      } else {
        console.error('No route found');
      }
    } catch (error) {
      console.error('Error fetching route: ', error);
    }
  };

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
    <div className="z-10 mx-4 mt-4 bg-neutral-200 p-4 rounded-lg shadow-lg flex flex-col md:flex-row justify-between items-center md:space-x-6 space-y-4 md:space-y-0">
      <div className="flex items-center justify-start gap-4">
        <div className="bg-red-200 rounded-full p-3">
        <FaCarAlt color='red' />
        </div>
        <div className=''>
          <h2 className="text-lg font-semibold text-gray-800">Car Type</h2>
          <p className="text-xl  text-gray-900">{carOwnerData.carType}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 justify-end">
        <div className="bg-green-200 rounded-full p-3">
        <FaBirthdayCake color ='green' />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Years Used</h2>
          <p className="text-xl text-gray-900">{carOwnerData.yearsUsed} years</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="bg-blue-200 rounded-full p-3">
        <FcDepartment color='green'/>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Department</h2>
          <p className="text-xl text-gray-900">{carOwnerData.department}</p>
        </div>
      </div>
    </div>

    <div className=" mx-4 mt-6 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg p-6 shadow-lg text-white space-y-4">
      {destination && (       
        <div className="flex-col items-right justify-start gap-4">
            <div className='flex items-center justify-start gap-3'>

          <div className="bg-white p-2 rounded-full shadow-md">
          <MdEditLocationAlt  color='red' />
          </div>
          <div>
            <p className="text-sm font-medium">Destination</p>
            <p className="text-xl font-semibold">{destination.name}</p>
          </div>
            </div>

          <div className='flex items-center mt-3 justify-start gap-3'>

          <div className="bg-white p-2 rounded-full shadow-md">
          <MdEditLocationAlt  color='red' />
          </div>
          <div>
            <p className="text-sm font-medium">Coordinates</p>
            <p className="text-xl font-semibold">Lat: {destination.coordinates.latitude}, Long: {destination.coordinates.longitude}</p>
          </div>
          </div>
        </div>
      )}
    </div>
  </>
)}


        <div className="flex justify-center mt-6 items-center h-screen">
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














// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { auth, db } from '../../components/firebase'; // Ensure auth is imported
// import { getDoc, doc, updateDoc } from 'firebase/firestore';
// import mapboxgl from 'mapbox-gl';
// import 'mapbox-gl/dist/mapbox-gl.css'; // Make sure to import the CSS

// mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// export default function Dashboard() {
//   const [carOwnerData, setCarOwnerData] = useState(null);
//   const [currentLocation, setCurrentLocation] = useState(null);
//   const mapContainerRef = useRef(null); // Use a ref for the map container
//   const mapRef = useRef(null); // Ref for the map instance
//   const markerRef = useRef(null);
//   const polylineRef = useRef(null); // Ref for the polyline

//   useEffect(() => {
//     const fetchData = async (userId) => {
//       const docRef = doc(db, 'carOwners', userId);
//       const docSnap = await getDoc(docRef);

//       if (docSnap.exists()) {
//         setCarOwnerData(docSnap.data());
//       } else {
//         console.error("No such document!");
//       }
//     };

//     // Check if the user is authenticated
//     const user = auth.currentUser;
//     if (user) {
//       fetchData(user.uid); // Pass user ID to fetchData
//     } else {
//       console.error("User not authenticated");
//     }
//   }, []); // Only run on mount

//   // Function to update location array in Firestore
//   const updateLocationInFirestore = async (userId, newLocation) => {
//     try {
//       const docRef = doc(db, 'carOwners', userId);
//       const docSnap = await getDoc(docRef);

//       if (docSnap.exists()) {
//         const carOwnerData = docSnap.data();
//         const updatedLocations = carOwnerData.locations || []; // Retrieve existing locations
//         updatedLocations.push(newLocation); // Add the new location to the array

//         // Update the locations array in Firestore
//         await updateDoc(docRef, { locations: updatedLocations });
//       }
//     } catch (error) {
//       console.error("Error updating location in Firestore: ", error);
//     }
//   };

//   useEffect(() => {
//     // Watch the user's location in real-time
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

//             // Update the locations array in Firestore for the authenticated user
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

//     watchLocation();
//   }, []); // Only run on mount

//   // Function to render a polyline for the stored location points
//   const renderPolyline = (locations) => {
//     if (mapRef.current && locations.length > 0) {
//       // Remove the existing polyline if any
//       if (polylineRef.current) {
//         polylineRef.current.remove();
//       }

//       // Create a new polyline from the location points
//       const coordinates = locations.map(loc => [loc.longitude, loc.latitude]);

//       polylineRef.current = new mapboxgl.Polyline({
//         path: coordinates,
//         geodesic: true,
//         strokeColor: '#FF0000',
//         strokeWeight: 2,
//       });

//       polylineRef.current.addTo(mapRef.current);
//     }
//   };

//   useEffect(() => {
//     if (mapContainerRef.current && currentLocation) {
//       if (!mapRef.current) {
//         mapRef.current = new mapboxgl.Map({
//           container: mapContainerRef.current,
//           style: 'mapbox://styles/mapbox/streets-v11',
//           center: currentLocation,
//           zoom: 14,
//         });
//       } else {
//         mapRef.current.setCenter(currentLocation);
//       }

//       // Remove existing marker if any
//       if (markerRef.current) {
//         markerRef.current.remove();
//       }

//       // Create a new marker
//       markerRef.current = new mapboxgl.Marker()
//         .setLngLat(currentLocation)
//         .addTo(mapRef.current);

//       // Add a popup for the marker
//       const popup = new mapboxgl.Popup({ offset: 25 })
//         .setText('You are here!')
//         .setLngLat(currentLocation);

//       markerRef.current.setPopup(popup);

//       // Ensure the map resizes properly with container
//       mapRef.current.resize();
//     }
//   }, [currentLocation]);

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
//               <h2 className="text-xl text-black">{carOwnerData.carType}</h2>
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
//           {/* Mapbox map container */}
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

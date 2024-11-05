'use client';
import { useState, useEffect, useRef } from 'react';
import { auth, db } from '../../components/firebase';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function Dashboard() {
  const [carOwnerData, setCarOwnerData] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderRef = useRef(null);

  useEffect(() => {
    const fetchData = async (userId) => {
      const docRef = doc(db, 'carOwners', userId);
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCarOwnerData(data);
        
        // Set the destination from Firestore if it exists
        if (data.destination) {
          setDestination(data.destination);
        }
      } else {
        console.error("No such document!");
      }
    };
  
    const user = auth.currentUser;
    if (user) {
      fetchData(user.uid);
    } else {
      console.error("User not authenticated");
    }
  }, []);
  

  const updateLocationInFirestore = async (userId, location, destDetails) => {
    try {
      const docRef = doc(db, 'carOwners', userId);
      await updateDoc(docRef, { location, destination: destDetails });
    } catch (error) {
      console.error("Error updating location in Firestore: ", error);
    }
  };

  useEffect(() => {
    const watchLocation = () => {
      if (navigator.geolocation) {
        const user = auth.currentUser;
        if (!user) {
          console.error("User not authenticated");
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
  }, []);

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

          updateLocationInFirestore(auth.currentUser.uid, { latitude: currentLocation[1], longitude: currentLocation[0] }, newDestination);

          // Fetch the route after setting the destination
          fetchRoute(currentLocation, newDestinationCoordinates);
        });

      } else {
        mapRef.current.setCenter(currentLocation);
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
              'line-color': '#888',
              'line-width': 8,
            },
          });
        }
      } else {
        console.error("No route found");
      }
    } catch (error) {
      console.error("Error fetching route: ", error);
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
            <div className="z-10 text-white p-4 flex justify-between items-center">
              <h2 className="text-xl text-black">{carOwnerData.carType}</h2>
              <h2 className="text-xl text-black">{carOwnerData.yearsUsed}</h2>
              <p className='text-black'>{carOwnerData.department}</p>
            </div>
            <div className="w-full p-4 bg-white space-y-4">
              <p>{carOwnerData.destination}</p>
              {destination && (
                <p className="text-black">Destination: {destination.name}</p>
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

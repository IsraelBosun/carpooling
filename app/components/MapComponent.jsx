// app/components/MapComponent.js
"use client"; // This is necessary for components using browser-specific libraries like Mapbox

import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

const MapComponent = () => {
  const mapContainerRef = useRef(null);

  useEffect(() => {
    // Initialize Mapbox
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN; // replace with your token
    
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11", // Choose your map style
      center: [-74.006, 40.7128], // Default coordinates (e.g., New York City)
      zoom: 12,
    });

    // Add navigation control (zoom buttons)
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Get the user's current position
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;

          // Set map center to user's location
          map.setCenter([longitude, latitude]);
          map.setZoom(15);

          // Add a marker at the user's location
          new mapboxgl.Marker().setLngLat([longitude, latitude]).addTo(map);
        },
        (error) => {
          console.error("Error obtaining location: ", error);
        }
      );
    }

    return () => map.remove(); // Clean up on unmount
  }, []);

  return <div ref={mapContainerRef} className="w-full h-96" />; // Adjust height as needed
};

export default MapComponent;

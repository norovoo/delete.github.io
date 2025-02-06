import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ClipLoader } from 'react-spinners';

// Custom Leaflet icon
const icon = L.icon({
  iconUrl: 'https://leafletjs.com/examples/custom-icons/leaf-green.png',
  iconSize: [38, 95],
});

const LocationMap = () => {
  const [locations, setLocations] = useState([]); // State for technician locations
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(''); // Error state

  const WEBSOCKET_URL = 'ws://192.168.254.112:3000'; // WebSocket URL

  useEffect(() => {
    // Setup WebSocket connection
    const ws = new WebSocket(WEBSOCKET_URL);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setLoading(false);
    };

    ws.onmessage = (message) => {
      try {
        const data = JSON.parse(message.data);

        if (data.type === 'location') {
          // Update technician location dynamically
          setLocations((prevLocations) => {
            const existingIndex = prevLocations.findIndex(
              (loc) => loc.technician_id === data.userId
            );

            if (existingIndex !== -1) {
              // Update existing technician's location
              const updatedLocations = [...prevLocations];
              updatedLocations[existingIndex] = {
                ...updatedLocations[existingIndex],
                latitude: data.latitude,
                longitude: data.longitude,
              };
              return updatedLocations;
            } else {
              // Add new technician's location
              return [
                ...prevLocations,
                {
                  id: Date.now(), // Temporary ID for new entry
                  technician_id: data.userId,
                  latitude: data.latitude,
                  longitude: data.longitude,
                },
              ];
            }
          });
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('WebSocket connection error. Check the server.');
    };

    return () => {
      if (ws) ws.close(); // Close WebSocket on component unmount
    };
  }, [WEBSOCKET_URL]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', margin: '20px' }}>
        <ClipLoader size={50} color={'#007bff'} />
        <p>Loading map...</p>
      </div>
    );
  }

  if (error) {
    return <div style={{ textAlign: 'center', color: 'red' }}>{error}</div>;
  }

  const centerPosition =
    locations.length > 0
      ? [locations[0].latitude, locations[0].longitude]
      : [51.505, -0.09]; // Default coordinates

  return (
    <MapContainer
      center={centerPosition}
      zoom={13}
      style={{ height: '100vh', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      {locations.map((location) => (
        <Marker
          key={location.id || `${location.technician_id}-${location.latitude}`}
          position={[location.latitude, location.longitude]}
          icon={icon}
        >
          <Popup>
            Technician ID: {location.technician_id} <br /> Last seen here.
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default LocationMap;
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { parseLocationString } from "../utils/parseLocationString";
import "leaflet/dist/leaflet.css";
import useEventContext from "../contexts/EventContext";

// Helper function to generate random color
const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export default function EventLiveMap() {
  const { eventJoiners, isWatchStarted } = useEventContext();
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds>(
    new L.LatLngBounds()
  );

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current || !isWatchStarted) return;

    const map = L.map(mapRef.current).setView([1, 1], 4);
    leafletMapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);
  }, [isWatchStarted]);

  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map || !isWatchStarted) return;

    const markers = markersRef.current;
    const bounds = new L.LatLngBounds();

    eventJoiners.forEach((joiner) => {
      if (!joiner.location) return; // Skip if location is undefined or null

      const { latitude, longitude } = parseLocationString(joiner.location);
      const existing = markers.get(joiner.id);

      const color = getRandomColor(); // Generate random color for each joiner

      if (existing) {
        existing.setLatLng([latitude, longitude]);
      } else {
        // Create a marker with a label showing joiner's name
        const marker = L.marker([latitude, longitude], {
          icon: L.divIcon({
            className: "leaflet-div-icon",
            html: `<div style="background-color: ${color}; padding: 5px; border-radius: 50%; color: white; font-size: 12px; text-align: center; font-weight: bold;">${joiner.guest.name.charAt(
              0
            )}</div>`,
            iconSize: [30, 30],
          }),
        })
          .addTo(map)
          .bindPopup(joiner.guest.name); // Show name in popup
        markers.set(joiner.id, marker);
      }

      // Add marker to the bounds to calculate zoom level
      bounds.extend([latitude, longitude]);
    });

    // Optionally: remove markers for users who are no longer in the list
    const currentIDs = new Set(eventJoiners.map((j) => j.id));
    markers.forEach((marker, id) => {
      if (!currentIDs.has(id)) {
        map.removeLayer(marker);
        markers.delete(id);
      }
    });

    // Adjust zoom and center based on the bounds of the markers
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [eventJoiners, isWatchStarted]);

  return <div ref={mapRef} style={{ height: "500px", width: "100%" }} />;
}

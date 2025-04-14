import clsx from "clsx";
import { useEffect, useRef } from "react";
import L from "leaflet";
import { parseLocationString } from "../utils/parseLocationString";
import "leaflet/dist/leaflet.css";
import useEventContext from "../contexts/EventContext";

// Helper to generate random hex color
// const getRandomColor = (): string => {
//   const letters = "0123456789ABCDEF";
//   let color = "#";
//   for (let i = 0; i < 6; i++) {
//     color += letters[Math.floor(Math.random() * 16)];
//   }
//   return color;
// };

// Choose readable text color
// const getTextColor = (bgColor: string): string => {
//   const r = parseInt(bgColor.slice(1, 3), 16);
//   const g = parseInt(bgColor.slice(3, 5), 16);
//   const b = parseInt(bgColor.slice(5, 7), 16);
//   const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
//   return luminance > 186 ? "#000000" : "#FFFFFF";
// };

const createJoinerMarker = (
  joiner: any
) => `<div class='flex items-center flex-col gap-1'>
            <img src=${
              joiner.guest.avatar ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            } class='h-10 w-10 bg-white rounded-full border border-blue-500 shadow-2xl'/><span class='border border-gray-100 text-[10px] bg-white px-2 py-1 rounded-full shadow-2xl block max-w-24 truncate'>${
  joiner.guest.name
}</span></div>`;

const createEventMarker = (event: any) =>
  `<div style='background-color: white; color: black; border: 1px solid #d9534f; padding: 4px 6px; border-radius: 6px; font-size: 12px; text-align: center; box-shadow: 0 0 4px rgba(0,0,0,0.4);'>📍 ${event.name}</div>`;

export default function EventLiveMap({ className }: { className?: string }) {
  const { eventJoiners, event } = useEventContext();
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const locationCount = useRef<Map<string, number>>(new Map());
  const eventMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    const map = L.map(mapRef.current).setView([1, 1], 4);
    leafletMapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);
  }, []);

  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    const markers = markersRef.current;
    const bounds = new L.LatLngBounds([]);
    locationCount.current.clear();

    // Add or update event location marker
    if (event?.location) {
      const { latitude, longitude } = parseLocationString(event.location);
      if (!isNaN(latitude) && !isNaN(longitude)) {
        const latLng = [latitude, longitude] as [number, number];

        if (eventMarkerRef.current) {
          eventMarkerRef.current.setLatLng(latLng);
        } else {
          eventMarkerRef.current = L.marker(latLng, {
            icon: L.divIcon({
              className: "leaflet-div-icon",
              html: createEventMarker(event),
              iconSize: [60, 25],
            }),
          })
            .addTo(map)
            .bindPopup("Event Location");
        }

        bounds.extend(latLng);
      }
    }

    // Add or update guest markers
    eventJoiners.forEach((joiner) => {
      if (!joiner.location) return;

      let { latitude, longitude } = parseLocationString(joiner.location);
      if (isNaN(latitude) || isNaN(longitude)) return;

      const key = `${latitude.toFixed(5)},${longitude.toFixed(5)}`;
      const count = locationCount.current.get(key) || 0;
      locationCount.current.set(key, count + 1);

      const offset = count * 0.0001;
      const lat = latitude + offset;
      const lng = longitude + offset;

      const existing = markers.get(joiner.id);

      if (existing) {
        existing.setLatLng([lat, lng]);
      } else {
        const marker = L.marker([lat, lng], {
          icon: L.divIcon({
            className: "leaflet-div-icon",
            html: createJoinerMarker(joiner),
            iconSize: [10, 10],
          }),
        })
          .addTo(map)
          .bindPopup(joiner.guest.name);

        markers.set(joiner.id, marker);
      }

      bounds.extend([lat, lng]);
    });

    // Remove markers for users who left
    const currentIDs = new Set(eventJoiners.map((j) => j.id));
    markers.forEach((marker, id) => {
      if (!currentIDs.has(id)) {
        map.removeLayer(marker);
        markers.delete(id);
      }
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [eventJoiners, event?.location]);

  return (
    <div
      ref={mapRef}
      className={clsx("", className)}
      style={{ height: "500px", width: "100%" }}
    />
  );
}

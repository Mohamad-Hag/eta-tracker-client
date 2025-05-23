import { IconCircleDotted, IconPlus } from "@tabler/icons-react";
import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import "./App.css";
import HereLocationPicker from "./components/HereLocationPicker";
import LocationPermissionProxy from "./components/LocationPermissionProxy";
import HOST from "./consts/host";
import useAppContext from "./contexts/AppContext";

function App() {
  const { socket, guest, isInEvent, userLocation } = useAppContext();
  const [eventId, setEventId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [location, setLocation] = useState<string | null>(null);
  const [creating, setCreating] = useState<boolean>(false);
  const navigate = useNavigate();
  const [eventDate, setEventDate] = useState<string>("");
  const create = async () => {
    if (isInEvent) {
      toast.error(
        "You can't create an event while you are already in another event"
      );
      return;
    }
    if (!name) {
      toast.error("Event name is required");
      return;
    }

    if (!guest) {
      toast.error("You are not logged in");
      return;
    }

    if (!eventDate) {
      toast.error("Event date is required");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          setCreating(true);
          const response = await axios.post(`${HOST}/api/events/create`, {
            name,
            event_date: eventDate,
            location:
              location ||
              `${position.coords.latitude},${position.coords.longitude}`,
            guest_id: guest?.id,
            guest_name: guest?.name,
            guest_avatar: guest?.avatar,
          });
          if (response.status === 201) {
            setEventId(response.data.id);
            toast.success("Event created successfully");
            navigate(`/join/${response.data.id}`);
          } else toast.error("Failed to create event");
          setCreating(false);
        } catch (error) {
          console.error("Error creating event:", error);
          toast.error("Failed to create event");
          setCreating(false);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        toast.error("Error getting location");
        setCreating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <LocationPermissionProxy>
      <div className="flex flex-col items-center justify-center gap-4 py-10 w-full">
        <h1 className="text-xl font-medium">Welcome {guest?.name}!</h1>
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 w-full md:w-auto">
          <div className="flex flex-col gap-2 md:bg-gray-100 md:border p-4 md:rounded-md w-full">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              className="border border-gray-300 rounded-md p-2 w-full"
              placeholder="Event Name"
            />
            <input
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              type="datetime-local"
              className="border border-gray-300 rounded-md p-2 w-full"
            />
            <HereLocationPicker
              onSelect={(location) => {
                setLocation(`${location.lat},${location.lng}`);
              }}
              placeholder="Event Location..."
              currentLocation={userLocation}
            />
          </div>
          <div className="md:self-end flex flex-col md:flex-row items-center gap-2 text-nowrap w-full md:w-auto px-4 md:px-0">
            <button
              className="button text-nowrap w-full"
              onClick={create}
              style={{
                opacity:
                  !guest || !socket || !eventDate || !name || creating
                    ? 0.5
                    : 1,
              }}
              disabled={!guest || !socket || !eventDate || !name || creating}
            >
              {creating ? "Creating..." : "Create Event"}{" "}
              {creating ? (
                <IconCircleDotted className="animate-spin" />
              ) : (
                <IconPlus />
              )}
            </button>
            OR Join
            <form
              className="flex items-center gap-1 w-full md:w-auto"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                type="text"
                placeholder="Event ID"
                className="border border-gray-300 rounded-md p-2 w-full md:w-auto"
              />
              {eventId !== "" && (
                <Link to={`/join/${eventId}`}>
                  <button className="button button-outline">Join Event</button>
                </Link>
              )}
            </form>
          </div>
        </div>
      </div>
    </LocationPermissionProxy>
  );
}

export default App;

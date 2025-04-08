import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import "./App.css";
import HereLocationPicker from "./components/HereLocationPicker";
import HOST from "./consts/host";
import useAppContext from "./contexts/AppContext";

function App() {
  const { socket, guest, isInEvent } = useAppContext();
  const [eventId, setEventId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [location, setLocation] = useState<string | null>(null);
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
          const response = await axios.post(`${HOST}/api/events/create`, {
            name,
            event_date: eventDate,
            location:
              location ||
              `${position.coords.latitude},${position.coords.longitude}`,
            guest_id: guest?.id,
            guest_name: guest?.name,
          });
          if (response.status === 201) {
            setEventId(response.data.id);
            toast.success("Event created successfully");
            navigate(`/join/${response.data.id}`);
          } else toast.error("Failed to create event");
        } catch (error) {
          console.error("Error creating event:", error);
          toast.error("Failed to create event");
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        toast.error("Error getting location");
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-10">
      <h1 className="text-xl font-medium">Welcome {guest?.name}!</h1>
      <div className="flex flex-col md:flex-row items-center justify-center gap-2">
        <div className="flex flex-col gap-2 bg-gray-100 border p-4 rounded-md">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            className="border border-gray-300 rounded-md p-2"
            placeholder="Event Name"
          />
          <input
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            type="datetime-local"
            className="border border-gray-300 rounded-md p-2"
          />
          <HereLocationPicker
            onSelect={(location) => {
              setLocation(`${location.lat},${location.lng}`);
            }}
            placeholder="Event Location..."
          />
        </div>
        <div className="md:self-end flex flex-col md:flex-row items-center gap-2">
          <button
            className="button"
            onClick={create}
            disabled={!guest || !socket || !eventDate || !name}
          >
            Create Event
          </button>
          OR Join
          <form
            className="flex items-center gap-1"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              type="text"
              placeholder="Event ID"
              className="border border-gray-300 rounded-md p-2"
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
  );
}

export default App;

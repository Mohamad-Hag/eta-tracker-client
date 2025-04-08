import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import ShareJoinLink from "../components/ShareJoinLink";
import Text from "../components/Text";
import HOST from "../consts/host";
import useAppContext from "../contexts/AppContext";

function JoinEvent() {
  const { socket, guest, isInEvent } = useAppContext();
  const { eventId } = useParams<{ eventId: string }>();
  const [eventData, setEventData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (isInEvent) setLoading(false);
    if (!socket) return;

    // Fetch event details when component mounts
    const fetchEventData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${HOST}/api/events/${eventId}`);
        setEventData(response.data);
      } catch (error) {
        console.error("Error fetching event data:", error);
        toast.error("Failed to fetch event data");
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [eventId, socket, isInEvent]);

  if (loading) return <Text>Loading event data...</Text>;
  if (!eventData) return <Text>Event not found</Text>;

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-10">
      <h1 className="text-xl font-medium">{eventData.name}</h1>
      <p>{`Event Date: ${new Date(eventData.event_date).toLocaleString()}`}</p>
      <p>{`Location: ${eventData.location}`}</p>
      {isInEvent && <p className="animate-pulse">You already in this event!</p>}

      <div className="flex flex-col gap-6">
        <div className="flex gap-2 mt-4 items-center">
          <Link to={`/event/${eventId}`}>
            <button className="button" disabled={!guest || !socket}>
              {isInEvent ? "Continue!" : "Join Event"}
            </button>
          </Link>
          <button
            className="button button-outline"
            onClick={() => navigate("/")}
          >
            Back to Home
          </button>
        </div>
        <ShareJoinLink id={eventId!} />
      </div>
    </div>
  );
}

export default JoinEvent;

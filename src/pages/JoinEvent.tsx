import {
  IconCalendar,
  IconCircleDotted,
  IconDoorEnter,
  IconHome,
  IconMap,
  IconZoomExclamation,
} from "@tabler/icons-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import LocationPermissionProxy from "../components/LocationPermissionProxy";
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

  if (loading)
    return (
      <Text leftIcon={<IconCircleDotted className="animate-spin" />}>
        Loading event data...
      </Text>
    );
  if (!eventData)
    return <Text leftIcon={<IconZoomExclamation />}>Event not found</Text>;
  return (
    <LocationPermissionProxy>
      <div className="flex flex-col items-center justify-center gap-4 py-10">
        <h1 className="text-xl font-medium">{eventData.name}</h1>
        <p className="flex items-center gap-1">
          <IconCalendar size={18} />
          {`Event Date: ${new Date(eventData.event_date).toLocaleString()}`}
        </p>
        <p className="flex items-center gap-1">
          <IconMap size={18} />
          {`Location: ${eventData.location}`}
        </p>
        {isInEvent && (
          <p className="animate-pulse">You already in this event!</p>
        )}

        <div className="flex flex-col gap-6 w-full md:w-auto px-4">
          <div className="flex gap-2 mt-4 items-center">
            <Link to={`/event/${eventId}`} className="flex-1">
              <button className="button w-full" disabled={!guest || !socket}>
                {isInEvent ? "Continue!" : "Join Event"} <IconDoorEnter />
              </button>
            </Link>
            <button
              className="button button-outline flex-1 text-nowrap"
              onClick={() => navigate("/")}
            >
              Back to Home <IconHome />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <ShareJoinLink id={eventId!} />
        </div>
      </div>
    </LocationPermissionProxy>
  );
}

export default JoinEvent;

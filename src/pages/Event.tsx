import {
  IconCalendarEvent,
  IconDoorExit,
  IconDots,
  IconPin,
  IconPlayerPlay,
  IconPlayerStop,
} from "@tabler/icons-react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import EventJoiner from "../components/EventJoiner";
import EventLiveMap from "../components/EventLiveMap";
import LocationPermissionProxy from "../components/LocationPermissionProxy";
import ShareJoinLink from "../components/ShareJoinLink";
import Text from "../components/Text";
import useAppContext from "../contexts/AppContext";
import useEventContext from "../contexts/EventContext";
import useETAUpdatedEvent from "../hooks/useETAUpdatedEvent";
import useJoinEvent from "../hooks/useJoinEvent";
import useLeaveEvent from "../hooks/useLeaveEvent";
import useLoadEvent from "../hooks/useLoadEvent";
import useUserJoinedEvent from "../hooks/useUserJoinedEvent";
import useUserLeftEvent from "../hooks/useUserLeftEvent";

export default function Event() {
  const { eventId } = useParams<{ eventId: string }>();
  const {
    event,
    eventJoiners,
    isWatchStarted,
    startWatch,
    stopWatch,
    isWatching,
  } = useEventContext();
  const { guest } = useAppContext();
  const { loading: eventLoading } = useLoadEvent(eventId);
  const { leave: leaveEvent, leaving } = useLeaveEvent();

  const isLast = eventJoiners.length === 1;
  const leaveConfirmMessage = `Are you sure you want to leave the event? ${
    isLast
      ? "This will automatically delete the event because you are the last one"
      : ""
  }`;

  const leave = () => {
    const confirmed = window.confirm(leaveConfirmMessage);
    if (confirmed) leaveEvent();
  };

  useJoinEvent(eventId);

  // Event Listners
  useUserJoinedEvent();
  useETAUpdatedEvent();
  useUserLeftEvent();

  const openEventDetails = () => {
    toast.info(
      <div className="flex flex-col">
        <p>Event Name: {event.name}</p>
        <p>Event Date: {new Date(event.event_date).toLocaleString()}</p>
        <p>Location: {event.location}</p>
      </div>
    );
  };

  if (leaving) return <Text>Leaving...</Text>;
  if (eventLoading) return <Text>Loading...</Text>;
  return (
    <LocationPermissionProxy>
      <>
        <EventLiveMap className="max-h-[45vh] shadow-xl !shadow-[#00000005] rounded-b-2xl relative z-10" />
        <div className="flex justify-center">
          <div className="flex flex-col gap-4 items-start justify-center py-10 md:px-2 w-full md:max-w-md">
            <div className="flex items-center justify-between w-full px-4 py-4 md:rounded-lg">
              <h1 className="text-xl font-medium flex w-full items-center gap-2 decoration-wavy underline decoration-blue-500 underline-offset-2">
                <IconCalendarEvent /> {event.name}
              </h1>
              <button
                className="max-h-10 max-w-10 min-w-10 min-h-10 rounded-full hover:bg-blue-50 text-gray-500 hover:text-blue-500 flex items-center justify-center"
                onClick={openEventDetails}
              >
                <IconDots />
              </button>
            </div>
            <div className="flex items-center gap-2 border-b md:border-b-0 pb-6 w-full px-4">
              <button
                className="button flex-1"
                onClick={isWatchStarted ? stopWatch : startWatch}
              >
                {isWatchStarted ? "Stop" : "Start"}
                {isWatchStarted ? <IconPlayerStop /> : <IconPlayerPlay />}
              </button>
              <button className="button button-outline flex-1" onClick={leave}>
                Leave <IconDoorExit />
              </button>
            </div>
            <div className="flex flex-col w-full items-center">
              {eventJoiners.map((joiner) => (
                <EventJoiner key={joiner.guest.id} joiner={joiner} />
              ))}
            </div>
            <ShareJoinLink id={event.id} />
            <span
              className={
                "text-sm flex items-center gap-1 font-light fixed z-20 bg-white p-2 rounded-full shadow-xl pointer-events-none duration-300"
              }
              style={{
                opacity: isWatching ? 0.95 : 0,
                top: isWatching ? 10 : 0,
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              <IconPin size={14} />
              Refreshing Current Location...
            </span>
          </div>
        </div>
      </>
    </LocationPermissionProxy>
  );
}

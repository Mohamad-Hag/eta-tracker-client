import { useParams } from "react-router-dom";
import Text from "../components/Text";
import useAppContext from "../contexts/AppContext";
import useEventContext from "../contexts/EventContext";
import useETAUpdatedEvent from "../hooks/useETAUpdatedEvent";
import useJoinEvent from "../hooks/useJoinEvent";
import useLeaveEvent from "../hooks/useLeaveEvent";
import useLoadEvent from "../hooks/useLoadEvent";
import useUserJoinedEvent from "../hooks/useUserJoinedEvent";
import useUserLeftEvent from "../hooks/useUserLeftEvent";
import { secondsToDurationString } from "../utils/secondsToDuration";
import ShareJoinLink from "../components/ShareJoinLink";
import EventLiveMap from "../components/EventLiveMap";

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
  const leaveEvent = useLeaveEvent();

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

  if (eventLoading) return <Text>Loading...</Text>;
  return (
    <div className="flex flex-col gap-4 items-center justify-center py-10">
      <h1 className="text-xl font-medium flex flex-col items-center">
        <span className="font-light">Hi {guest.name}, you're in</span>{" "}
        {event.name}{" "}
      </h1>
      <div className="flex items-center gap-2">
        <button
          className="button"
          onClick={isWatchStarted ? stopWatch : startWatch}
        >
          {isWatchStarted ? "Stop" : "Start"}
        </button>
        <button className="button button-outline" onClick={leave}>
          Leave Event
        </button>
      </div>
      <table className="table-auto border-collapse">
        <thead>
          <tr className="bg-blue-200">
            <th className="px-4 py-2 border border-blue-500">Joiner Name</th>
            <th className="px-4 py-2 border border-blue-500">ETA</th>
            <th className="px-4 py-2 border border-blue-500">Status</th>
          </tr>
        </thead>
        <tbody>
          {eventJoiners.map((joiner) => (
            <tr
              key={joiner.guest.id}
              className="odd:bg-blue-50 even:bg-blue-100"
            >
              <td className="px-4 py-2 border border-blue-500">
                {joiner.guest.name}
              </td>
              <td className="px-4 py-2 border border-blue-500">
                {joiner.eta ? secondsToDurationString(joiner.eta) : "-"}
              </td>
              <td className="px-4 py-2 border border-blue-500">
                {joiner.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ShareJoinLink id={event.id} />
      {isWatching && (
        <span className="text-sm font-light absolute top-2">
          Refreshing Current Location...
        </span>
      )}
      <EventLiveMap />
    </div>
  );
}

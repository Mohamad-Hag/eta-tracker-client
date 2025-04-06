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
        {isWatching && (
          <span className="text-sm font-light">
            Refreshing Current Location...
          </span>
        )}
      </h1>
      <div className="flex items-center gap-2">
        <button
          className="button"
          onClick={isWatchStarted ? stopWatch : startWatch}
        >
          {isWatchStarted ? "Stop" : "Start"}
        </button>
        <button className="button button-outline" onClick={leaveEvent}>
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
    </div>
  );
}

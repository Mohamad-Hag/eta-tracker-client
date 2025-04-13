import {
  IconCheck,
  IconClock,
  IconClockCheck,
  IconClockPin,
  IconClockX,
  IconDoorExit,
  IconPlayerPlay,
  IconPlayerStop,
} from "@tabler/icons-react";
import clsx from "clsx";
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
import LocationPermissionProxy from "../components/LocationPermissionProxy";

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

  if (leaving) return <Text>Leaving...</Text>;
  if (eventLoading) return <Text>Loading...</Text>;
  return (
    <LocationPermissionProxy>
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
            {isWatchStarted ? <IconPlayerStop /> : <IconPlayerPlay />}
          </button>
          <button className="button button-outline" onClick={leave}>
            Leave <IconDoorExit />
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
                <td
                  className={clsx(
                    "px-4 flex flex-col items-center gap-1 py-2 border border-blue-500 font-medium",
                    {
                      "text-red-500": joiner.late?.isLate,
                      "text-green-500": joiner.status === "On Time",
                      "text-yellow-500":
                        joiner.status === "Late" ||
                        joiner.status === "Very Late",
                      "text-gray-500": joiner.status === "Arrived",
                      "text-blue-500": joiner.status === "Not Started",
                      "text-purple-500":
                        joiner.status === "Early" ||
                        joiner.status === "Very Early",
                    }
                  )}
                >
                  <span className="flex items-center gap-1">
                    {joiner.status}
                    {joiner.late?.isLate ? (
                      <IconClockX size={18} />
                    ) : (
                      iconStatusMap[joiner.status as keyof typeof iconStatusMap]
                    )}
                    {joiner.early?.isEarly ? <IconClockPin size={18} /> : null}
                  </span>
                  {joiner.late?.amount && joiner.late.isLate ? (
                    <span className="text-sm flex items-center gap-1">
                      {`(By ${secondsToDurationString(joiner.late.amount)})`}
                    </span>
                  ) : null}
                  {joiner.early?.amount && joiner.early.isEarly ? (
                    <span className="text-sm flex items-center gap-1">
                      {`(By ${secondsToDurationString(joiner.early.amount)})`}
                    </span>
                  ) : null}
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
    </LocationPermissionProxy>
  );
}

const iconStatusMap = {
  "On Time": <IconClockCheck size={18} />,
  Late: <IconClock size={18} />,
  "Very Late": <IconClockX size={18} />,
  Arrived: <IconCheck size={18} />,
  "Not Started": <IconPlayerPlay size={18} />,
};

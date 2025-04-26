import {
  IconCheck,
  IconCircleFilled,
  IconClock,
  IconClockCheck,
  IconClockPin,
  IconClockX,
  IconPlayerPlay,
} from "@tabler/icons-react";
import clsx from "clsx";
import useAppContext from "../contexts/AppContext";
import useEventContext from "../contexts/EventContext";
import { TransportModeObject, transportModes } from "../typings/TransportMode";
import { secondsToDurationString } from "../utils/secondsToDuration";
import Avatar from "./Avatar";

interface EventJoinerProps {
  joiner: any;
}

export default function EventJoiner({ joiner }: EventJoinerProps) {
  const { guest } = useAppContext();
  const { waves } = useEventContext();
  const isYou = guest.id === joiner.guest?.id;
  const isWaving = waves.some((w) => w.joinerId === joiner.guest?.id);
  const waveType = isWaving
    ? waves.find((w) => w.joinerId === joiner.guest?.id)?.type
    : null;
  const waveEmoji =
    waveType === "love" ? "💖" : waveType === "wave" ? "👋" : "👋";
  const isOnline = joiner.connected;
  const isArrived = joiner.status === "Arrived";
  const mode: TransportModeObject = transportModes.find((m) =>
    joiner.transport_mode
      ? m.value === joiner.transport_mode
      : m.value === "car"
  )!;

  return (
    <div
      className={clsx(
        "flex items-center gap-4 p-4 bg-white md:rounded-2xl md:shadow-sm border-b md:border-t md:border-x md:hover:shadow-md transition-all w-full md:max-w-md",
        { "opacity-50": isYou ? false : isOnline === false }
      )}
    >
      {/* Avatar */}
      <Avatar
        source={joiner.guest?.avatar}
        isYou={isYou}
        onlineBadge
        isOnline={isYou ? true : isOnline}
      />

      {/* Name and Status */}
      <div className="flex-1">
        <div className="font-semibold text-base text-nowrap flex items-center gap-1">
          <span className="truncate">
            {joiner.guest?.name} {isYou && "(You)"}
          </span>
          {mode && joiner.status !== "Arrived" && (
            <span className="scale-75 text-gray-500 border border-gray-300 bg-gray-100 h-8 w-8 flex items-center justify-center rounded-lg">
              {mode.icon}
            </span>
          )}
        </div>
        <div className="text-sm text-gray-500 flex items-center flex-wrap gap-1 mt-1">
          <div className="flex items-center gap-1">
            {joiner.late?.isLate && !isArrived ? (
              <IconClockX size={14} className="text-red-500" />
            ) : joiner.early?.isEarly && !isArrived ? (
              <IconClockPin size={14} className="text-purple-500" />
            ) : (
              iconStatusMap[joiner.status as keyof typeof iconStatusMap] ?? (
                <IconCircleFilled size={14} className="text-gray-500" />
              )
            )}
            <span>{joiner.status}</span>
          </div>
          {(joiner.late?.isLate || joiner.early?.isEarly) && !isArrived && (
            <span className="text-[11px] font-light flex items-center gap-1">
              <IconCircleFilled size={5} />
              {joiner.late?.amount && joiner.late.isLate
                ? `${secondsToDurationString(joiner.late.amount)}`
                : joiner.early?.amount && joiner.early.isEarly
                ? `${secondsToDurationString(joiner.early.amount)}`
                : null}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        {isWaving && <span className="text-lg animate-pulse">{waveEmoji}</span>}
        {/* ETA Badge */}
        <div className="text-xs bg-gray-100 text-gray-800 px-3 py-1 rounded-full flex items-center gap-1">
          <IconClock className="w-4 h-4" />
          <span>
            {joiner.eta && !isArrived
              ? secondsToDurationString(joiner.eta)
              : "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
}

const iconStatusMap = {
  "On Time": <IconClockCheck size={18} className="text-green-500" />,
  Late: <IconClock size={18} className="text-red-500" />,
  "Too Late": <IconClockX size={18} className="text-red-600" />,
  Arrived: <IconCheck size={18} className="text-gray-500" />,
  "Not Started": <IconPlayerPlay size={18} className="text-blue-500" />,
};

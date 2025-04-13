import { createContext, useContext, useState } from "react";
import useStartWatch from "../hooks/useStartWatch";

interface IEventContext {
  event: any;
  setEvent: (event: any) => void;
  eventJoiners: any[];
  setEventJoiners: React.Dispatch<React.SetStateAction<any[]>>;
  startWatch: () => void;
  stopWatch: () => void;
  isWatchStarted: boolean;
  isWatching: boolean;
  waves: { wave: React.ReactNode; id: string; joinerId: string }[];
  setWaves: React.Dispatch<
    React.SetStateAction<
      { wave: React.ReactNode; id: string; joinerId: string }[]
    >
  >;
}

const EventContext = createContext<IEventContext>(null!);

export const EventProvider = ({ children }: { children: React.ReactNode }) => {
  const [event, setEvent] = useState<any>(null);
  const [eventJoiners, setEventJoiners] = useState<any[]>([]);
  const { isWatchStarted, isWatching, startWatch, stopWatch } =
    useStartWatch(event);
  const [waves, setWaves] = useState<
    { wave: React.ReactNode; id: string; joinerId: string }[]
  >([]);

  return (
    <EventContext.Provider
      value={{
        event,
        setEvent,
        eventJoiners,
        setEventJoiners,
        startWatch,
        stopWatch,
        isWatchStarted,
        isWatching,
        waves,
        setWaves,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export default function useEventContext() {
  if (!EventContext)
    throw new Error("useEventContext must be used within an EventProvider");
  return useContext<IEventContext>(EventContext);
}

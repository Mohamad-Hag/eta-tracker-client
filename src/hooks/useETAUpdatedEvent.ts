import { useEffect } from "react";
import useAppContext from "../contexts/AppContext";
import useEventContext from "../contexts/EventContext";
import { TransportMode } from "../typings/TransportMode";
import useStartWatch from "./useStartWatch";

interface ETAUpdatedEvent {
  guestId: string;
  location: string;
  eta: number;
  status: string;
  late: { isLate: boolean; amount: number }; // Amount in Minutes
  early: { isEarly: boolean; amount: number }; // Amount in Minutes
  transportMode: TransportMode;
}

const useETAUpdatedEvent = () => {
  const { socket, isOnline, guest } = useAppContext();
  const { setEventJoiners, event, isWatchStarted } = useEventContext();
  const { stopWatch } = useStartWatch(event?.id);

  useEffect(() => {
    if (!socket || !guest || !isOnline) return;

    const handleETAUpdated = (data: ETAUpdatedEvent) => {
      console.log(
        `ETA updated for guest ${data.guestId} to ${data.eta} minutes. His current location is ${data.location}`
      );
      const isCurrentGuest = data.guestId === guest.id;

      if (isCurrentGuest && data.status === "Arrived" && isWatchStarted)
        stopWatch();

      setEventJoiners((prev) =>
        prev.map((joiner) =>
          joiner.guest.id === data.guestId
            ? {
                ...joiner,
                eta: data.eta,
                status: data.status,
                location: data.location,
                late: data.late,
                early: data.early,
                transport_mode: data.transportMode,
              }
            : joiner
        )
      );
    };

    socket.on("etaUpdated", handleETAUpdated);

    return () => {
      console.log("Cleaning et event");
      socket.off("etaUpdated", handleETAUpdated); // Clean up on unmount
    };
  }, [socket, setEventJoiners, isOnline]); // Only depend on socket, setEventJoiners, and isOnline state
};

export default useETAUpdatedEvent;

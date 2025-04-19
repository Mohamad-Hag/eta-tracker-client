import { useEffect } from "react";
import useAppContext from "../contexts/AppContext";
import useEventContext from "../contexts/EventContext";
import { TransportMode } from "../typings/TransportMode";

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
  const { socket } = useAppContext();
  const { setEventJoiners } = useEventContext();

  useEffect(() => {
    if (!socket) return;

    const handleETAUpdated = (data: ETAUpdatedEvent) => {
      console.log(
        `ETA updated for guest ${data.guestId} to ${data.eta} minutes. His current location is ${data.location}`
      );

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
  }, [socket, setEventJoiners]); // Only depend on socket and setEventJoiners
};

export default useETAUpdatedEvent;

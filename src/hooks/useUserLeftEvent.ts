import { useEffect } from "react";
import useAppContext from "../contexts/AppContext";
import useEventContext from "../contexts/EventContext";
import { toast } from "sonner";

interface UserLeftEvent {
  guest: any;
}

const useUserLeftEvent = () => {
  const { socket, guest } = useAppContext();
  const { setEventJoiners, stopWatch, event, isWatchStarted } =
    useEventContext();
  useEffect(() => {
    if (!socket || !event || !guest) return;

    const handleUserLeft = (data: UserLeftEvent) => {
      console.log(`User ${data.guest.name} left the event ${event.id}⬆️`);

      // Check if the guest is the current guest and if watch is started to stop watching location, then remove the guest from the event joiners list
      setEventJoiners((prev) => {
        const isCurrentGuest = data.guest.id === guest.id;
        if (isCurrentGuest && isWatchStarted) stopWatch();
        toast.info(
          `${isCurrentGuest ? "You" : data.guest.name} left the event ⬆️`
        );
        return prev.filter((joiner) => joiner.guest.id !== data.guest.id);
      });
    };

    socket.on("userLeft", handleUserLeft);

    return () => {
      console.log("Cleaning userLeft event");
      socket.off("userLeft", handleUserLeft); // Clean up on unmount
    };
  }, [socket, event, setEventJoiners, stopWatch, guest]);
};

export default useUserLeftEvent;

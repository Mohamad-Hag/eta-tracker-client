import { useEffect } from "react";
import useAppContext from "../contexts/AppContext";
import useEventContext from "../contexts/EventContext";
import { toast } from "sonner";

interface UserDisconnectedEvent {
  guest: any;
  eventId: string;
}

const useUserDisconnectedEvent = () => {
  const { socket, guest, isOnline } = useAppContext();
  const { setEventJoiners, event } = useEventContext();

  useEffect(() => {
    if (!socket || !event || !guest || !isOnline) return;

    const handleUserDisconnected = (data: UserDisconnectedEvent) => {
      console.log(
        `User ${data.guest.name} disconnected from event ${data.eventId}`
      );

      // Check if the guest already exists in the list of event joiners
      setEventJoiners((prev) => {
        const existJoiner = prev.find(
          (joiner) => joiner.guest.id === data.guest.id
        );
        const isCurrentGuest = data.guest.id === guest.id;
        if (existJoiner) {
          toast.info(
            `${isCurrentGuest ? "You're" : data.guest.name + " is "} offline 🚫`
          );
          return prev.map((joiner) => {
            if (joiner.guest.id === data.guest.id) {
              return {
                ...joiner,
                connected: false,
              };
            }
            return joiner;
          });
        }
        return prev;
      });
    };

    socket.on("userDisconnected", handleUserDisconnected);

    return () => {
      console.log("Cleaning userDisconnected event");
      socket.off("userDisconnected", handleUserDisconnected); // Clean up on unmount
    };
  }, [socket, event, setEventJoiners, guest, isOnline]); // Only depend on socket and setEventJoiners
};

export default useUserDisconnectedEvent;

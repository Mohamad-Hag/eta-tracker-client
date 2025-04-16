import { useEffect } from "react";
import useAppContext from "../contexts/AppContext";
import useEventContext from "../contexts/EventContext";
import { toast } from "sonner";

interface UserJoinedEvent {
  guest: any;
  eventId: string;
}

const useUserJoinedEvent = () => {
  const { socket, guest } = useAppContext();
  const { setEventJoiners, startWatch, event } = useEventContext();

  useEffect(() => {
    if (!socket || !event || !guest) return;

    const handleUserJoined = (data: UserJoinedEvent) => {
      console.log(`User ${data.guest.name} joined event ${data.eventId}`);

      // Check if the guest already exists in the list of event joiners
      setEventJoiners((prev) => {
        const isJoinerExist = prev.some(
          (joiner) => joiner.guest.id === data.guest.id
        );
        const isCurrentGuest = data.guest.id === guest.id;
        if (!isJoinerExist) {
          toast.info(
            `${isCurrentGuest ? "You" : data.guest.name} joined the event ⬅️`
          );
          const newGuest = {
            guest: data.guest,
            eta: null,
            status: "Not Started",
            connected: true,
          };
          return [...prev, newGuest];
        }

        // Check if the current existing joiner status is not "Not Started". If yes we should start watching location.
        const existJOiner = prev.find(
          (joiner) => joiner.guest.id === data.guest.id
        );
        if (existJOiner.status !== "Not Started") startWatch();
        console.log("dddddd", prev.map((joiner) =>
          joiner.guest.id === data.guest.id
            ? { ...joiner, connected: true }
            : joiner
        ))
        return prev.map((joiner) =>
          joiner.guest.id === data.guest.id
            ? { ...joiner, connected: true }
            : joiner
        );
      });
    };

    socket.on("userJoined", handleUserJoined);

    return () => {
      console.log("Cleaning userJoined event");
      socket.off("userJoined", handleUserJoined); // Clean up on unmount
    };
  }, [socket, event, setEventJoiners, startWatch, guest]); // Only depend on socket and setEventJoiners
};

export default useUserJoinedEvent;

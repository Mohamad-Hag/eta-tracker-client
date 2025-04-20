import { useEffect } from "react";
import useAppContext from "../contexts/AppContext";
import useEventContext from "../contexts/EventContext";
import { toast } from "sonner";

interface UserJoinedEvent {
  guest: any;
  eventId: string;
}

const useUserJoinedEvent = () => {
  const { socket, guest, isOnline } = useAppContext();
  const { setEventJoiners, startWatch, event, setTransportMode } =
    useEventContext();

  useEffect(() => {
    if (!socket || !event || !guest || !isOnline) return;

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
        const existJoiner = prev.find(
          (joiner) => joiner.guest.id === data.guest.id
        );
        setTransportMode(existJoiner.transportMode || "car");
        if (existJoiner.status !== "Not Started")
          startWatch(existJoiner.transportMode);
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
  }, [socket, event, setEventJoiners, startWatch, guest, isOnline]); // Only depend on socket and setEventJoiners
};

export default useUserJoinedEvent;

import { useEffect } from "react";
import useAppContext from "../contexts/AppContext";
import useCreateWave from "./useCreateWave";
import { WaveType } from "../contexts/EventContext";

interface JoinerWavedEvent {
  eventId: string;
  guest: any;
  type: WaveType;
}

const useJoinerWavedEvent = () => {
  const { socket } = useAppContext();
  const createWave = useCreateWave();

  useEffect(() => {
    if (!socket) return;

    const handleJoinerWaved = (data: JoinerWavedEvent) => {
      console.log(
        `Guest ${data.guest.name} waved in the event ${data.eventId}👋`
      );
      createWave(data.guest.name, data.guest.id, data.type);
    };

    socket.on("joinerWaved", handleJoinerWaved);

    return () => {
      console.log("Cleaning joinerWaved event");
      socket.off("joinerWaved", handleJoinerWaved); // Clean up on unmount
    };
  }, [socket]);
};

export default useJoinerWavedEvent;

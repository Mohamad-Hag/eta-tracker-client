import { toast } from "sonner";
import useAppContext from "../contexts/AppContext";
import { joinEvent } from "../services/events";
import { useEffect } from "react";

const useJoinEvent = (id?: string, start: boolean = false) => {
  const { guest, socket } = useAppContext();

  const join = async () => {
    try {
      await joinEvent(id!, guest.id, socket!.id!);
      socket?.emit("registerUser", { guest, eventId: id! });
      console.log("Successfully joined the event! ✅");
    } catch (error) {
      console.error("Error joining event:", error);
      toast.error("Failed to join the event");
    }
  };

  useEffect(() => {
    if (!id || !guest || !socket || !socket.id || !start) return;
    join();
  }, [id, guest, socket, socket?.id, start]);
};

export default useJoinEvent;

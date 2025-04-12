import { toast } from "sonner";
import useAppContext from "../contexts/AppContext";
import { leaveEvent } from "../services/events";
import useEventContext from "../contexts/EventContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const useLeaveEvent = () => {
  const { event } = useEventContext();
  const { guest, setIsInEvent } = useAppContext();
  const [leaving, setLeaving] = useState<boolean>(false);
  const navigate = useNavigate();

  const leave = async () => {
    if (!event || !guest) return;
    setLeaving(true);
    try {
      await leaveEvent(event.id, guest.id);
      console.log("Successfully left the event! ✅");
      setIsInEvent(false);
      navigate("/");
    } catch (error) {
      console.error("Error leaving event:", error);
      toast.error("Failed to leave the event");
    }
    setLeaving(false);
  };

  return { leave, leaving };
};

export default useLeaveEvent;

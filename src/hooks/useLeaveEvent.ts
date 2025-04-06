import { toast } from "sonner";
import useAppContext from "../contexts/AppContext";
import { leaveEvent } from "../services/events";
import useEventContext from "../contexts/EventContext";
import { useNavigate } from "react-router-dom";

const useLeaveEvent = () => {
  const { event } = useEventContext();
  const { guest } = useAppContext();
  const navigate = useNavigate();

  const leave = async () => {
    if (!event || !guest) return;
    try {
      await leaveEvent(event.id, guest.id);
      console.log("Successfully left the event! ✅");
      navigate("/");
    } catch (error) {
      console.error("Error leaving event:", error);
      toast.error("Failed to leave the event");
    }
  };

  return leave;
};

export default useLeaveEvent;

import { toast } from "sonner";
import { isGuestInEvent } from "../services/events";

const useIsAlreadyInEvent = (guest: any) => {
  const checkIsAlreadyInEvent = async () => {
    try {
      const response = await isGuestInEvent(guest.id);
      return response.isGuestInEvent;
    } catch (error) {
      console.error("Error checking if guest is already in event:", error);
      toast.error("Failed to check if guest is already in event");
      return false;
    }
  };
  return checkIsAlreadyInEvent;
};

export default useIsAlreadyInEvent;

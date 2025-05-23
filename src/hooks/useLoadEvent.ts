import { useEffect, useState } from "react";
import { toast } from "sonner";
import useEventContext from "../contexts/EventContext";
import getEventJoiners, { getEventById } from "../services/events";
import useAppContext from "../contexts/AppContext";

const useLoadEvent = (id?: string) => {
  const { setEvent, setEventJoiners, setTransportMode } = useEventContext();
  const { guest, isOnline } = useAppContext();
  const [eventLoading, setEventLoading] = useState<boolean>(true);
  const [eventErrors, setEventErrors] = useState<string[]>([]);
  const [joinersLoading, setJoinersLoading] = useState<boolean>(true);

  const fetchEvent = async () => {
    if (!id) {
      toast.error("Event ID is required");
      return;
    }
    if (!isOnline) return;

    try {
      setEventLoading(true);
      const response = await getEventById(id);
      setEvent(response);
      if (response.error) setErrors("Failed to fetch event data");
    } catch (error) {
      setErrors("Failed to fetch event data", error);
    } finally {
      setEventLoading(false);
    }
  };

  const fetchEventJoiners = async () => {
    if (!id) {
      toast.error("Event ID is required");
      return;
    }

    if (!guest || !isOnline) return;

    try {
      setJoinersLoading(true);
      const response = await getEventJoiners(id);
      setEventJoiners(response);
      setTransportMode(
        response.find((j: any) => j.guest.id === guest.id)?.transport_mode ??
          "car"
      );
      if (response.error) setErrors("Failed to fetch event joiners");
    } catch (error) {
      setErrors("Failed to fetch event joiners", error);
    } finally {
      setJoinersLoading(false);
    }
  };

  const setErrors = (errorString: string, error?: any) => {
    setEventErrors((prev) => [...prev, errorString]);
    console.error(errorString, error ?? "");
    toast.error(errorString);
  };

  const loadEvent = async () => {
    await Promise.all([fetchEvent(), fetchEventJoiners()]);
  };

  useEffect(() => {
    loadEvent();
  }, [id, guest, isOnline]);

  return {
    loading: eventLoading || joinersLoading,
    errors: eventErrors,
  };
};

export default useLoadEvent;

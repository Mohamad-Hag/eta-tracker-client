import { useEffect, useState } from "react";
import { toast } from "sonner";
import useEventContext from "../contexts/EventContext";
import getEventJoiners, { getEventById } from "../services/events";

const useLoadEvent = (id?: string) => {
  const { event, setEvent, setEventJoiners } = useEventContext();
  const [eventLoading, setEventLoading] = useState<boolean>(true);
  const [joinersLoading, setJoinersLoading] = useState<boolean>(true);

  const fetchEvent = async () => {
    if (!id) {
      toast.error("Event ID is required");
      return;
    }

    try {
      setEventLoading(true);
      const response = await getEventById(id);
      setEvent(response);
    } catch (error) {
      console.error("Error fetching event data:", error);
      toast.error("Failed to fetch event data");
    } finally {
      setEventLoading(false);
    }
  };

  const fetchEventJoiners = async () => {
    if (!id) {
      toast.error("Event ID is required");
      return;
    }

    try {
      setJoinersLoading(true);
      const response = await getEventJoiners(id);
      setEventJoiners(response);
    } catch (error) {
      console.error("Error fetching event joiners:", error);
      toast.error("Failed to fetch event joiners");
    } finally {
      setJoinersLoading(false);
    }
  };

  const loadEvent = async () => {
    await Promise.all([fetchEvent(), fetchEventJoiners()]);
  };

  useEffect(() => {
    loadEvent();
  }, [id]);

  return { loading: eventLoading || joinersLoading };
};

export default useLoadEvent;

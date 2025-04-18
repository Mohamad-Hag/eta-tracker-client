import { useState } from "react";
import useAppContext from "../contexts/AppContext";
import { updateLocation } from "../services/events";
import { TransportMode } from "../typings/TransportMode";

const useStartWatch = (event: any) => {
  const { watchLocation, stopWatchLocation, guest, socket } = useAppContext();
  const [isWatchStarted, setIsWatchStarted] = useState<boolean>(false);
  const [isWatching, setIsWatching] = useState<boolean>(false);

  const startWatch = (transportMode: TransportMode = "car") => {
    if (!guest || !event || !socket) return;
    watchLocation(async (coords: any) => {
      setIsWatching(true);
      const update = await updateLocation(
        `${coords.latitude},${coords.longitude}`,
        guest?.id,
        event?.id,
        socket?.id!,
        transportMode
      );
      setIsWatching(false);
      return update;
    });
    setIsWatchStarted(true);
  };

  const stopWatch = () => {
    stopWatchLocation();
    setIsWatchStarted(false);
  };

  return { startWatch, stopWatch, isWatchStarted, isWatching };
};

export default useStartWatch;

import { v4 as uuidv4 } from "uuid";
import Wave from "../components/Wave";
import useEventContext from "../contexts/EventContext";
import { useRef } from "react";

const useCreateWave = () => {
  const { setWaves } = useEventContext();
  const timers = useRef<{ [key: string]: any }>({});

  const createWave = (
    label: string,
    joinerId: string,
    type: "love" | "wave" = "wave"
  ) => {
    if ("vibrate" in navigator) {
      navigator.vibrate(type === "love" ? 200 : 100);
    }

    const id = uuidv4(); // unique id for this wave
    const wave = {
      id,
      joinerId,
      wave: <Wave type={type} label={label} />,
      type,
    };

    setWaves((prev) => [...prev, wave]);

    timers.current[id] = setTimeout(() => {
      setWaves((prev) => prev.filter((w) => w.id !== id));
      delete timers.current[id];
    }, 2000);
  };

  return createWave;
};

export default useCreateWave;

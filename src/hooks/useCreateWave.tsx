import { v4 as uuidv4 } from "uuid";
import Wave from "../components/Wave";
import useEventContext from "../contexts/EventContext";

const useCreateWave = () => {
  const { setWaves } = useEventContext();

  const createWave = (label: string, joinerId: string) => {
    const id = uuidv4(); // unique id for this wave
    const wave = { id, joinerId, wave: <Wave label={label} /> };

    setWaves((prev) => [...prev, wave]);

    setTimeout(() => {
      setWaves((prev) => prev.filter((w) => w.id !== id));
    }, 2000);
  };

  return createWave;
};

export default useCreateWave;

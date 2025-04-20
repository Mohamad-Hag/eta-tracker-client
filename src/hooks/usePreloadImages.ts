import { useEffect } from "react";
import useAppContext from "../contexts/AppContext";

const usePreloadImages = (images: string[], start: boolean = true) => {
  const { isOnline } = useAppContext();
  useEffect(() => {
    if (!start || !isOnline) return;
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [start, isOnline]);
};

export default usePreloadImages;

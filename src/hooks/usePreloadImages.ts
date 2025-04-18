import { useEffect } from "react";

const usePreloadImages = (images: string[], start: boolean = true) => {
  useEffect(() => {
    if (!start) return;
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [start]);
};

export default usePreloadImages;

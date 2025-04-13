import { AppLocation } from "../utils/parseLocationString";

function useAskLocationPermission() {
  const askLocationPermission = (
    onGranted: (location: AppLocation) => void,
    onDenied: () => void
  ) => {
    let isGranted = false;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("User granted location access on prompt");
        onGranted({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        isGranted = true;
      },
      () => {
        console.error("User denied location access");
        onDenied();
        isGranted = false;
      }
    );
    return isGranted;
  };

  return askLocationPermission;
}

export default useAskLocationPermission;

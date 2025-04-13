import { useEffect } from "react";
import { AppLocation } from "../utils/parseLocationString";
import useAskLocationPermission from "./useAskLocationPermission";

const useCheckLocationPermission = (
  setIsLocationPermissionGranted: (value: boolean) => void,
  setUserLocation: (value: AppLocation | null) => void
) => {
  const askLocationPermission = useAskLocationPermission();
  useEffect(() => {
    const checkAndRequestPermission = async () => {
      if (!("geolocation" in navigator)) {
        console.error("Geolocation is not supported by this browser.");
        return;
      }

      if ("permissions" in navigator) {
        try {
          const result = await navigator.permissions.query({
            name: "geolocation",
          });

          if (result.state === "granted") {
            // Already granted, get location directly
            navigator.geolocation.getCurrentPosition((position) => {
              console.log("Location retrieved (granted)");
              setIsLocationPermissionGranted(true);
              setUserLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
            });
          } else if (result.state === "prompt") {
            // Ask the user
            askLocationPermission(
              (location) => {
                setIsLocationPermissionGranted(true);
                setUserLocation({
                  latitude: location.latitude,
                  longitude: location.longitude,
                });
              },
              () => {
                setIsLocationPermissionGranted(false);
              }
            );
          } else {
            // Denied
            console.warn("Location access has been denied previously");
            setIsLocationPermissionGranted(false);
          }

          // Optional: Watch for changes in permission
          result.onchange = () => {
            console.log("Permission changed:", result.state);
          };
        } catch (err) {
          console.error("Permission check failed:", err);
        }
      } else {
        // Fallback: Try requesting directly if Permissions API not supported
        (navigator as Navigator).geolocation.getCurrentPosition(
          (position: GeolocationPosition) => {
            setIsLocationPermissionGranted(true);
            setUserLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          () => {
            setIsLocationPermissionGranted(false);
          }
        );
      }
    };

    checkAndRequestPermission();
  }, []);
};

export default useCheckLocationPermission;

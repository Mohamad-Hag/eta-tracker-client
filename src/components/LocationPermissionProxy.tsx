import { IconRefresh } from "@tabler/icons-react";
import Text from "./Text";
import useAppContext from "../contexts/AppContext";
import useAskLocationPermission from "../hooks/useAskLocationPermission";
import { toast } from "sonner";

interface LocationPermissionProxyProps {
  children: React.ReactNode;
}

export default function LocationPermissionProxy({
  children,
}: LocationPermissionProxyProps) {
  const {
    isLocationPermissionGranted,
    setUserLocation,
    setIsLocationPermissionGranted,
  } = useAppContext();
  const askLocationPermission = useAskLocationPermission();
  if (isLocationPermissionGranted) return children;

  const ask = () => {
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
        toast.error(
          "You can only grant location permission from your browser settings"
        );
      }
    );
  };

  return (
    <div className="flex items-center flex-col gap-1">
      <Text>The application needs location permission</Text>{" "}
      <div className="flex flex-col md:flex-row items-center gap-1">
        <button className="button" onClick={ask}>
          Ask for Permission
        </button>
        <button
          className="button button-outline"
          onClick={() => window.location.reload()}
        >
          Refresh the Page <IconRefresh />
        </button>
      </div>
    </div>
  );
}

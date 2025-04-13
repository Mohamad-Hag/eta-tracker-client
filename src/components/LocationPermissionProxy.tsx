import { IconRefresh } from "@tabler/icons-react";
import Text from "./Text";
import useAppContext from "../contexts/AppContext";

interface LocationPermissionProxyProps {
  children: React.ReactNode;
}

export default function LocationPermissionProxy({
  children,
}: LocationPermissionProxyProps) {
  const { isLocationPermissionGranted } = useAppContext();
  if (isLocationPermissionGranted) return children;
  return (
    <div className="flex items-center flex-col gap-1">
      <Text>The application needs location permission</Text>{" "}
      <button className="button" onClick={() => window.location.reload()}>
        Refresh the Page <IconRefresh />
      </button>
    </div>
  );
}

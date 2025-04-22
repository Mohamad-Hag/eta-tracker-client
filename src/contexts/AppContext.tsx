import { lorelei } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import axios from "axios";
import React, { createContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import HOST from "../consts/host";
import useCheckLocationPermission from "../hooks/useCheckLocationPermission";
import useIsAlreadyInEvent from "../hooks/useIsAlreadyInEvent";
import { AppLocation } from "../utils/parseLocationString";

type Guest = any;

interface AppContextType {
  guest: Guest | null;
  setGuest: (guest: Guest | null) => void;
  currentGuests: Guest[];
  setCurrentGuests: (guests: Guest[]) => void;
  createGuest: (name: string) => Promise<void>;
  socket: Socket | null;
  setSocket: (socket: Socket | null) => void;
  stopWatchLocation: () => void;
  watchLocation: (onWatch: (...args: any) => void) => void;
  isLocationPermissionGranted: boolean;
  setIsLocationPermissionGranted: React.Dispatch<React.SetStateAction<boolean>>;
  isInEvent: boolean;
  setIsInEvent: React.Dispatch<React.SetStateAction<boolean>>;
  userLocation: AppLocation | null;
  setUserLocation: React.Dispatch<React.SetStateAction<AppLocation | null>>;
  isOnline: boolean;
  setIsOnline: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = (props: { children: React.ReactNode }) => {
  const [guest, setGuest] = useState<Guest | null>(null);
  const [currentGuests, setCurrentGuests] = useState<Guest[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isInEvent, setIsInEvent] = useState<boolean>(false);
  const isGuestInEvent = useIsAlreadyInEvent(guest);
  const [userLocation, setUserLocation] = useState<AppLocation | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  const [isLocationPermissionGranted, setIsLocationPermissionGranted] =
    useState<boolean>(true);
  const watchIdRef = useRef<number | null>(null);
  const hasPromptedRef = useRef<boolean>(false);

  const setIsAlreadyInEvent = async () => {
    setIsInEvent(await isGuestInEvent());
  };

  useEffect(() => {
    if (guest) setIsAlreadyInEvent();
  }, [guest]);

  const stopWatchLocation = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const watchLocation = async (onWatch: (...args: any) => void) => {
    if (watchIdRef.current !== null) return; // Prevent multiple watchers

    if ("geolocation" in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        async (position) => {
          await onWatch(position.coords);
        },
        (error) => console.error("Geolocation error:", error),
        { enableHighAccuracy: true }
      );
    }
  };

  const createGuest = async (name: string) => {
    const guestId = uuidv4();
    try {
      const seed = Math.random().toString(36).substring(2, 12);
      const avatar = createAvatar(lorelei, {
        size: 128,
        seed,
      }).toDataUri();
      const response = await axios.post(`${HOST}/api/guests/create`, {
        name,
        avatar,
        guest_id: guestId,
      });
      if (response.status === 201) {
        console.log(response.data);
        const newGuest = response.data;
        setGuest(newGuest);
        localStorage.setItem("guest", JSON.stringify(newGuest));
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const storedGuest = localStorage.getItem("guest");
    if (!storedGuest) {
      if (!hasPromptedRef.current) {
        const name = prompt("What's your name?");
        if (name) {
          createGuest(name);
          hasPromptedRef.current = true;
        }
      }
    } else setGuest(JSON.parse(storedGuest));
  }, []);

  const handleOffline = () => {
    toast.warning("You're offline 🚫 Check your connection...");
    setIsOnline(false);
  };

  const handleOnline = () => {
    toast.success("Back online ✅");
    setIsOnline(true);
    socket?.connect();
  };

  const handleVisibilityChange = (soc: Socket) => {
    if (document.visibilityState === "visible") {
      console.log("Guest reconnected to server...");
      console.log("Socket Connected State:", soc?.connected);
      soc?.connect();
    }
  };

  // Watchdog to ensure the socket is always connected
  useEffect(() => {
    const interval = setInterval(() => {
      if (socket && !socket.connected && isOnline) {
        console.log("Manually trying to reconnect...");
        socket.connect();
      }
    }, 5000); // every 5 seconds

    return () => clearInterval(interval);
  }, [socket, isOnline]);

  useEffect(() => {
    const soc = io(HOST, {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });
    soc.on("connect", () => {
      console.log("Guest connected to server...");
    });
    soc.on("reconnect_attempt", (attemptNumber) => {
      console.log(`🔁 Reconnect attempt #${attemptNumber}`);
      toast.info(`Reconnect attempt #${attemptNumber}`);
    });
    soc.on("disconnect", () => {
      console.log("Guest disconnected from server...");
    });
    setSocket(soc);

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    window.addEventListener("visibilitychange", () =>
      handleVisibilityChange(soc)
    );

    return () => {
      soc.disconnect();
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("visibilitychange", () =>
        handleVisibilityChange(soc)
      );
    };
  }, []);

  useCheckLocationPermission(setIsLocationPermissionGranted, setUserLocation);

  return (
    <AppContext.Provider
      value={{
        guest,
        setGuest,
        currentGuests,
        setCurrentGuests,
        createGuest,
        socket,
        setSocket,
        stopWatchLocation,
        watchLocation,
        isLocationPermissionGranted,
        setIsLocationPermissionGranted,
        isInEvent,
        setIsInEvent,
        userLocation,
        setUserLocation,
        isOnline,
        setIsOnline,
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
};

const useAppContext = () => {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
};

export default useAppContext;

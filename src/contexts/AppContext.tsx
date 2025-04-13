import React, { createContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { io, Socket } from "socket.io-client";
import HOST from "../consts/host";
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
  isInEvent: boolean;
  setIsInEvent: React.Dispatch<React.SetStateAction<boolean>>;
  userLocation: AppLocation | null;
  setUserLocation: React.Dispatch<React.SetStateAction<AppLocation | null>>;
}

export const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = (props: { children: React.ReactNode }) => {
  const [guest, setGuest] = useState<Guest | null>(null);
  const [currentGuests, setCurrentGuests] = useState<Guest[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isInEvent, setIsInEvent] = useState<boolean>(false);
  const isGuestInEvent = useIsAlreadyInEvent(guest);
  const [userLocation, setUserLocation] = useState<AppLocation | null>(null);

  const [isLocationPermissionGranted, setIsLocationPermissionGranted] =
    useState<boolean>(false);
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
      const response = await axios.post(`${HOST}/api/guests/create`, {
        name,
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

  useEffect(() => {
    const soc = io(HOST);
    soc.on("connect", () => {
      console.log("Guest connected to server...");
    });
    setSocket(soc);

    return () => {
      soc.disconnect();
    };
  }, [HOST]);

  useEffect(() => {
    const requestPermission = async () => {
      if ("geolocation" in navigator) {
        try {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log("Got location");
              setIsLocationPermissionGranted(true);
              setUserLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
            },
            () => {
              console.error("Location permission denied");
              setIsLocationPermissionGranted(false);
            }
          );
        } catch (error) {
          console.error("Error getting location:", error);
          setIsLocationPermissionGranted(false);
        }
      }
    };
    requestPermission();
  }, []);

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
        isInEvent,
        setIsInEvent,
        userLocation,
        setUserLocation,
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

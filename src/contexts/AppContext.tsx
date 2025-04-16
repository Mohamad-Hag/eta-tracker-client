import axios from "axios";
import React, { createContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import HOST from "../consts/host";
import useCheckLocationPermission from "../hooks/useCheckLocationPermission";
import useIsAlreadyInEvent from "../hooks/useIsAlreadyInEvent";
import { AppLocation } from "../utils/parseLocationString";
import { createAvatar } from "@dicebear/core";
import { lorelei } from "@dicebear/collection";

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

  useEffect(() => {
    const soc = io(HOST);
    soc.on("connect", () => {
      console.log("Guest connected to server...");
    });
    soc.on("disconnect", () => {
      console.log("Guest disconnected from server...");
    });
    setSocket(soc);

    return () => {
      soc.disconnect();
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

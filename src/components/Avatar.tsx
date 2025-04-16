import { lorelei } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import clsx from "clsx";
import { useMemo } from "react";
import useAppContext from "../contexts/AppContext";

interface AvatarProps {
  source?: string;
  isYou?: boolean;
  withName?: boolean;
  isOnline?: boolean;
  onlineBadge?: boolean;
}

export default function Avatar({
  source,
  isYou = false,
  withName = false,
  isOnline,
  onlineBadge = false,
}: AvatarProps) {
  const { guest, socket } = useAppContext();
  const avatar = useMemo(() => {
    if (source) return source;
    else if (guest?.avatar) return guest.avatar;
    const seed = Math.random().toString(36).substring(2, 12);
    return createAvatar(lorelei, {
      size: 128,
      seed,
    }).toDataUri();
  }, [source, guest?.avatar]);

  const isGuestOnline = isOnline ?? socket?.connected;

  return (
    <div className="flex items-center gap-2 group">
      <div className="relative">
        <img
          src={avatar}
          className={clsx(
            "w-14 h-14 rounded-full object-cover border-blue-200 border bg-blue-50 group-hover:border-blue-500",
            { "!border-blue-500 border-dashed": isYou }
          )}
        />
        {onlineBadge && (
          <div
            className={clsx(
              "size-2 rounded-full duration-300 absolute top-1 right-1",
              {
                "bg-green-500": isGuestOnline,
                "bg-red-500": !isGuestOnline,
              }
            )}
          />
        )}
      </div>
      {withName && guest?.name && (
        <div className="flex flex-col">
          {guest?.name}{" "}
          <span className="text-xs">
            {isGuestOnline ? "Online" : "Offline"}
          </span>
        </div>
      )}
    </div>
  );
}

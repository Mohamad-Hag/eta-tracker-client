import { lorelei } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import clsx from "clsx";
import { useMemo } from "react";
import useAppContext from "../contexts/AppContext";

interface AvatarProps {
  source?: string;
  isYou?: boolean;
  withName?: boolean;
}

export default function Avatar({
  source,
  isYou = false,
  withName = false,
}: AvatarProps) {
  const { guest } = useAppContext();
  const avatar = useMemo(() => {
    if (source) return source;
    else if (guest?.avatar) return guest.avatar;
    const seed = Math.random().toString(36).substring(2, 12);
    return createAvatar(lorelei, {
      size: 128,
      seed,
    }).toDataUri();
  }, [source, guest?.avatar]);

  return (
    <div className="flex items-center gap-2 group">
      <img
        src={avatar}
        className={clsx(
          "w-14 h-14 rounded-full object-cover border-blue-500 border-dashed bg-blue-50 group-hover:border group-hover:border-double",
          { border: isYou }
        )}
      />
      {withName && guest?.name && (
        <div className="flex flex-col">
          {guest?.name} <span className="text-xs">Online</span>
        </div>
      )}
    </div>
  );
}

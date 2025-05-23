import { Link, useLocation } from "react-router-dom";
import Avatar from "./Avatar";
import { IconTrack } from "@tabler/icons-react";

export default function Header() {
  const { pathname } = useLocation();
  const isEventPage = pathname.startsWith("/event");
  if (isEventPage) return null;
  return (
    <header className="md:container mx-auto px-4 py-4 border-b flex items-center justify-between shadow-sm md:shadow-none">
      <Link to="/">
        <h1 className="font-bold font-mono flex items-center gap-1">
          <IconTrack className="text-blue-500" />
          ETA Tracker
        </h1>
      </Link>
      <Avatar withName />
    </header>
  );
}

import { IconCircleDotted, IconCircleFilled } from "@tabler/icons-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { AppLocation } from "../utils/parseLocationString";

const DEFAULT_LOCATION = { latitude: 24.4539, longitude: 54.3773 }; // Abu Dhabi fallback

const HereLocationPicker = ({
  onSelect,
  placeholder = "Search for a location...",
  currentLocation,
  limit = 10,
  countryCode = "ARE",
}: {
  onSelect: (location: any) => void;
  placeholder?: string;
  currentLocation?: AppLocation | null;
  limit?: number;
  countryCode?: string;
}) => {
  const HERE_API_KEY = import.meta.env.VITE_HERE_API_KEY; // Replace with your API key
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 500);
  const [suggestions, setSuggestions] = useState([]);
  const [isSelectQuery, setIsSelectQuery] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const lat = currentLocation?.latitude ?? DEFAULT_LOCATION.latitude;
  const lng = currentLocation?.longitude ?? DEFAULT_LOCATION.longitude;
  const locationParam = `&at=${lat},${lng}`;
  const countryCodeParam = countryCode ? `&in=countryCode:${countryCode}` : "";

  const searchPlaces = async (input: string) => {
    if (input.length < 3) return;
    setIsLoading(true);
    try {
      const res = await axios.get(
        `https://discover.search.hereapi.com/v1/discover?q=${input}&lang=en${locationParam}${countryCodeParam}&limit=${limit}&apiKey=${HERE_API_KEY}`
      );
      setSuggestions(res.data.items);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (place: any) => {
    const location = place.position;
    if (location) onSelect(location);
    setSuggestions([]);
    setQuery(place.title || place.address?.label || "");
    setIsSelectQuery(true);
  };

  useEffect(() => {
    if (isSelectQuery || debouncedQuery.length < 3) return;
    searchPlaces(debouncedQuery);
  }, [debouncedQuery]);

  const splitCategories = (categories: any) => {
    return (
      categories
        ?.reduce((acc: string, category: any) => {
          return acc + category.name + ", ";
        }, "")
        .slice(0, -2) || "General"
    );
  };

  return (
    <div className="relative w-full">
      <div className="w-full relative">
        <input
          type="text"
          value={query}
          className="border !w-full !px-4 h-10 rounded-md"
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsSelectQuery(false);
          }}
        />
        {isLoading && (
          <div className="absolute top-1/2 right-2 -translate-y-1/2 text-xs text-gray-500 px-2 py-1 rounded-full">
            <IconCircleDotted className="animate-spin" />
          </div>
        )}
      </div>
      {suggestions.length > 0 && query.length > 0 && (
        <ul
          className="absolute top-12 z-10 bg-white border py-4 rounded-lg shadow-lg w-full max-h-[50vh] overflow-auto"
          style={{
            opacity: isLoading ? 0.5 : 1,
            pointerEvents: isLoading ? "none" : "auto",
          }}
        >
          {suggestions.map((place: any) => (
            <li
              key={place.id}
              title={place.title}
              onClick={() => handleSelect(place)}
              className="truncate text-sm py-2 flex flex-col px-4 cursor-pointer hover:bg-gray-100 active:bg-gray-200"
            >
              <span className="truncate">
                {place.title || place.address?.label}
              </span>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs text-gray-500 truncate flex-1"
                  title={splitCategories(place.categories)}
                >
                  {splitCategories(place.categories)}
                </span>
                <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                  {place.openingHours ? (
                    <>
                      <IconCircleFilled
                        size={8}
                        color={
                          place.openingHours?.[0]?.isOpen ? "green" : "red"
                        }
                      />
                      {place.openingHours?.[0]?.isOpen ? "Open" : "Closed"}
                    </>
                  ) : (
                    "Unknown"
                  )}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HereLocationPicker;

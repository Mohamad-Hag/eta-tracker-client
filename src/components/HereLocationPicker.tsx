import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import axios from "axios";

const HERE_API_KEY = "w44HZpzdET7cNp_06KGItYDi8E3SEE4y7S_PvtBM4rI"; // Replace with your API key

const HereLocationPicker = ({
  onSelect,
  placeholder = "Search for a location...",
}: {
  onSelect: (location: any) => void;
  placeholder?: string;
}) => {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 300);
  const [suggestions, setSuggestions] = useState([]);
  const [isSelectQuery, setIsSelectQuery] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const searchPlaces = async (input: string) => {
    if (input.length < 3) return; // Prevent unnecessary API calls
    setIsLoading(true);
    try {
      const res = await axios.get(
        `https://autocomplete.search.hereapi.com/v1/autocomplete?q=${input}&apiKey=${HERE_API_KEY}`
      );
      setSuggestions(res.data.items);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getLocationById = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `https://lookup.search.hereapi.com/v1/lookup?id=${id}&apiKey=${HERE_API_KEY}`
      );
      const location = res.data?.position;
      return location;
    } catch (error) {
      console.error("Error fetching location by id:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = async (place: any) => {
    const location = await getLocationById(place.id);
    if (location) onSelect(location);
    setSuggestions([]);
    setQuery(place.title);
    setIsSelectQuery(true);
  };

  useEffect(() => {
    if (isSelectQuery || debouncedQuery.length < 3) return;
    searchPlaces(debouncedQuery);
  }, [debouncedQuery]);

  return (
    <div className="relative w-60">
      <div className="w-60 relative">
        <input
          type="text"
          value={query}
          className="border !w-60 !px-4 h-10 rounded-md"
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsSelectQuery(false);
          }}
        />
        {isLoading && (
          <div className="absolute top-1/2 right-2 -translate-y-1/2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            Loading...
          </div>
        )}
      </div>
      {suggestions.length > 0 && query.length > 0 && (
        <ul
          className="absolute top-12 z-10 bg-white border py-4 rounded-lg shadow-lg w-60"
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
              className="truncate text-sm py-2 px-4 cursor-pointer hover:bg-gray-100 active:bg-gray-200"
            >
              {place.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HereLocationPicker;

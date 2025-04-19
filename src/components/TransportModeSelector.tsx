import clsx from "clsx";
import {
  TransportMode,
  TransportModeObject,
  transportModes,
} from "../typings/TransportMode";
import { useEffect, useState } from "react";
import { IconArrowRight, IconChevronDown } from "@tabler/icons-react";

interface TransportModeSelectorProps {
  className?: string;
  mode?: TransportMode;
  onChange?: (mode: TransportModeObject) => void;
  readonly?: boolean;
}

export default function TransportModeSelector({
  className,
  mode,
  onChange,
  readonly = false,
}: TransportModeSelectorProps) {
  const [active, setActive] = useState<TransportMode | undefined>(mode);
  const [expanded, setExpanded] = useState<boolean>(false);

  useEffect(() => {
    if (readonly === true) setExpanded(false);
  }, [readonly]);

  const transportMode = transportModes.find((m) => m.value === active);

  return (
    <div className="px-4 w-full">
      <div
        className={clsx(
          "flex flex-col w-full gap-2 border rounded-lg overflow-hidden",
          {
            "!border-0": readonly,
          }
        )}
      >
        <button
          className={clsx(
            "text-gray-500 text-sm py-2 bg-gray-50 active:bg-gray-100 flex justify-between px-2 items-center gap-1 cursor-pointer",
            {
              "!bg-transparent cursor-not-allowed px-0": readonly,
            }
          )}
          onClick={() => {
            if (!readonly) setExpanded(!expanded);
          }}
        >
          <div className="flex items-center gap-1">
            Mode <IconArrowRight /> {transportMode?.label}{" "}
            <div className="scale-90">{transportMode?.icon}</div>
          </div>
          {!readonly && <IconChevronDown />}
        </button>
        {expanded && (
          <div
            className={clsx(
              "flex items-center px-2 gap-1 flex-wrap w-full pb-2",
              className
            )}
          >
            {transportModes.map((m) => (
              <button
                key={m.value}
                className={clsx(
                  "bg-gray-100 p-2 flex-1 text-nowrap justify-center select-none text-sm rounded-md active:bg-gray-200 flex items-center gap-1 text-gray-500",
                  {
                    "!bg-blue-500 text-white shadow-lg duration-200":
                      active === m.value,
                  }
                )}
                onClick={() => {
                  if (readonly) return;
                  setActive(m.value);
                  onChange?.(m);
                }}
              >
                {m.icon}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import {
  IconBike,
  IconBus,
  IconCar,
  IconScooter,
  IconTruck,
  IconWalk,
} from "@tabler/icons-react";

export interface TransportModeObject {
  label: string;
  value: string;
  icon: JSX.Element;
}

export const transportModes = [
  {
    value: "car",
    label: "Car",
    icon: <IconCar />,
  },
  {
    value: "pedestrian",
    label: "Pedestrian",
    icon: <IconWalk />,
  },
  {
    value: "bicycle",
    label: "Bicycle",
    icon: <IconBike />,
  },
  {
    value: "truck",
    label: "Truck",
    icon: <IconTruck />,
  },
  {
    value: "scooter",
    label: "Scooter",
    icon: <IconScooter />,
  },
  {
    value: "bus",
    label: "Bus",
    icon: <IconBus />,
  },
  {
    value: "taxi",
    label: "Taxi",
    icon: <IconCar />,
  },
  {
    value: "privateBus",
    label: "Private Bus",
    icon: <IconBus />,
  },
] as const;

export type TransportMode = (typeof transportModes)[number]["value"];

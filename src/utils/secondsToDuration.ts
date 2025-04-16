import { Duration, intervalToDuration } from "date-fns";

const secondsToDuration = (seconds: number): Duration => {
  const result = intervalToDuration({ start: 0, end: seconds * 1000 });
  return result;
};

const secondsToDurationString = (seconds: number): string => {
  const duration = secondsToDuration(seconds);
  const days = duration.days ?? 0;
  const hours = duration.hours ?? 0;
  const minutes = duration.minutes ?? 0;
  const secs = duration.seconds ?? 0;

  if (days) return `${days}d ${hours}h ${minutes}m ${secs}s`;
  if (hours) return `${hours}h ${minutes}m ${secs}s`;
  if (minutes) return `${minutes}m ${secs}s`;
  return `${secs}s`;
};

export { secondsToDuration, secondsToDurationString };

import { Duration, intervalToDuration } from "date-fns";

const secondsToDuration = (seconds: number): Duration => {
  const result = intervalToDuration({ start: 0, end: seconds * 1000 });
  return result;
};

const secondsToDurationString = (seconds: number): string => {
  const duration = secondsToDuration(seconds);
  if (duration.days)
    return `${duration.days}d ${duration.hours}h ${duration.minutes}m ${duration.seconds}s`;
  else if (duration.hours)
    return `${duration.hours}h ${duration.minutes}m ${duration.seconds}s`;
  else if (duration.minutes) return `${duration.minutes}m ${duration.seconds}s`;
  else return `${duration.seconds}s`;
};

export { secondsToDuration, secondsToDurationString };

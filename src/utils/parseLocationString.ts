export interface AppLocation {
  latitude: number;
  longitude: number;
}

export const parseLocationString = (locationString: string): AppLocation => {
  const [latitude, longitude] = locationString.split(",").map(Number);
  return { latitude, longitude };
};

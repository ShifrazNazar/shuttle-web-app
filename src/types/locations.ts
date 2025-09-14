export interface LocationData {
  locationId: string;
  name: string;
  fullName: string;
  type: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

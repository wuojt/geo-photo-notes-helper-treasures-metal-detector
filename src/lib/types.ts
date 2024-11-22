export interface PhotoMetadata {
  id: string;
  date: Date;
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
  };
  note?: string;
}

export interface Photo {
  id: string;
  url: string;
  metadata: PhotoMetadata;
}
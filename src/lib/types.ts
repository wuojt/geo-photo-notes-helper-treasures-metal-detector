export interface PhotoMetadata {
  id: string;
  date: Date;
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
  };
  notes: Array<{
    text: string;
    createdAt: Date;
  }>;
}

export interface Photo {
  id: string;
  url: string;
  metadata: PhotoMetadata;
}